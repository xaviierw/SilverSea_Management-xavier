const request = require("supertest");
const fs = require("fs").promises;
const { app, server } = require("../index");

afterAll(() => server.close());

describe("Silversea Management API - Facilities", () => {
    let agent;

//Login before each test so that there will be a valid session cookie
    beforeEach(async () => {
        agent = request.agent(app);

        const loginRes = await agent.post("/api/login").send({
            email: "admin@silversea.com",
            password: "test",
            role: "admin",
        });

    expect(loginRes.headers["set-cookie"]).toBeDefined();
  });

// 0)Unauthenticated access
    it("POST /api/facility should return 401 when not logged in", async () => {
        const res = await request(app).post("/api/facility").send({
            facility_id: "API-000",
            facility_name: "Gym",
            location: "Block 1",
        });

        expect([401, 302]).toContain(res.status);
        expect(res.headers.location).toBe("/index.html");
    });

// 1)Success case
    it("POST /api/facility should return 201 and create a facility", async () => {
        const newFacility = {
            facility_id: `API${Date.now().toString().slice(-7)}`,
            facility_name: "Basketball Court",
            description: "Start hoppin today",
            location: "Block 5",
            openinghours: "12:00 - 22:00",
            openingdays: "Monday - Sunday",
    };

    const res = await agent.post("/api/facility").send(newFacility);
        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Facility added successfully");
        expect(res.body.facility.facility_id).toBe(newFacility.facility_id);
        expect(res.body.facility.facility_name).toBe("Basketball Court");
    });

// 2)Missing facility_id
    it("POST /api/facility should return 400 when facility_id is missing", async () => {
        const res = await agent.post("/api/facility").send({
            facility_name: "Badminton Court",
            location: "Block 3",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "facility_id, facility_name and location are required",
        });
    });

// 3)Missing facility_name
    it("POST /api/facility should return 400 when facility_name is missing", async () => {
        const res = await agent.post("/api/facility").send({
            facility_id: "API-102",
            location: "Block 3",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "facility_id, facility_name and location are required",
        });
    });

// 4)Missing location
    it("POST /api/facility should return 400 when location is missing", async () => {
        const res = await agent.post("/api/facility").send({
            facility_id: "API-103",
            facility_name: "Gym",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "facility_id, facility_name and location are required",
        });
    });

// 4.1)facility_id exceeds character limit
    it("POST /api/facility should return 400 when facility_id exceeds 10 characters", async () => {
        const res = await agent.post("/api/facility").send({
            facility_id: "API-12345678", // 12 chars
            facility_name: "Badminton Court",
            location: "Block 3",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Facility ID must not exceed 10 characters" });
    });

// 4.2)facility_name exceeds character limit
    it("POST /api/facility should return 400 when facility_name exceeds 25 characters", async () => {
        const res = await agent.post("/api/facility").send({
            facility_id: "API-104",
            facility_name: "This facility name is over twenty five",
            location: "Block 3",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Facility name must not exceed 25 characters" });
    });

// 4.3)location exceeds character limit
    it("POST /api/facility should return 400 when location exceeds 25 characters", async () => {
        const res = await agent.post("/api/facility").send({
            facility_id: "API-105",
            facility_name: "Gym",
            location: "This location is definitely over twenty five",
        });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Facility location must not exceed 25 characters" });
    });

// 5)Duplicate facility_id
    it("POST /api/facility should return 409 when facility_id already exists", async () => {
        const payload = {
            facility_id: `DUP${Date.now().toString().slice(-7)}`,
            facility_name: "Swimming Pool",
            location: "Block 1",
        };

        //First create succeeds
        const first = await agent.post("/api/facility").send(payload);
        expect(first.status).toBe(201);

        //Second create with same ID should fail
        const second = await agent.post("/api/facility").send({
        ...payload,
        facility_name: "New Pool Name",
        });

        expect(second.status).toBe(409);
        expect(second.body).toEqual({ message: "Facility ID already exists" });
    });

// 6)Server error
    it("POST /api/facility should return 500 on server error", async () => {
        const spy = jest // Force fs.readFile to throw during this test
            .spyOn(require("fs").promises, "readFile")
            .mockRejectedValueOnce(new Error("Disk failure"));

        const res = await agent.post("/api/facility").send({
            facility_id: `ERR${Date.now().toString().slice(-7)}`,
            facility_name: "Tennis Court",
            location: "Block 9",
        });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: "Server error adding facility" });

        spy.mockRestore();
    });

// ENOENT file handling
    it("POST /api/facility should create facility when file does not exist (ENOENT)", async () => {
        const err = new Error("File not found");
        err.code = "ENOENT";

        const spy = jest
            .spyOn(require("fs").promises, "readFile")
            .mockRejectedValueOnce(err);

        const newFacility = {
            facility_id: `API${Date.now().toString().slice(-7)}`,
            facility_name: "Tennis Court",
            location: "Block 6",
        };

        const res = await agent.post("/api/facility").send(newFacility);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Facility added successfully");
        expect(res.body.facility.facility_id).toBe(newFacility.facility_id);

        spy.mockRestore();
    });
});
