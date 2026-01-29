const request = require("supertest");
const fs = require("fs").promises;
const { app, server } = require("../index");

afterAll((done) => server.close(done));

describe("Silversea Management API - Facilities", () => {
  let agent;

  beforeEach(async () => {
    agent = request.agent(app);

    const loginRes = await agent.post("/api/login").send({
      email: "admin@silversea.com",
      password: "test",
      role: "admin",
    });

    expect(loginRes.headers["set-cookie"]).toBeDefined();
  });

  // 0. Unsuccessful – unauthorized access
  it("POST /api/facility should return 401 when not logged in", async () => {
    const res = await request(app).post("/api/facility").send({
      facility_id: "API-000",
      facility_name: "Gym",
      location: "Block 1",
    });

    expect([401, 302]).toContain(res.status);
    expect(res.headers.location).toBe("/index.html");
  });

  // 1. Successful case – valid facility created
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

  // 2. Unsuccessful – missing required fields
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

  // 3. Unsuccessful – character length validation
  it("POST /api/facility should return 400 when facility_id exceeds 10 characters", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-12345678",
      facility_name: "Badminton Court",
      location: "Block 3",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Facility ID must not exceed 10 characters",
    });
  });

  it("POST /api/facility should return 400 when facility_name exceeds 25 characters", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-104",
      facility_name: "This facility name is over twenty five",
      location: "Block 3",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Facility name must not exceed 25 characters",
    });
  });

  it("POST /api/facility should return 400 when location exceeds 25 characters", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-105",
      facility_name: "Gym",
      location: "This location is definitely over twenty five",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Facility location must not exceed 25 characters",
    });
  });

  // 4. Unsuccessful – duplicate Facility ID
  it("POST /api/facility should return 409 when facility_id already exists", async () => {
    const payload = {
      facility_id: `DUP${Date.now().toString().slice(-7)}`,
      facility_name: "Swimming Pool",
      location: "Block 1",
    };

    const first = await agent.post("/api/facility").send(payload);
    expect(first.status).toBe(201);

    const second = await agent.post("/api/facility").send({
      ...payload,
      facility_name: "New Pool Name",
    });

    expect(second.status).toBe(409);
    expect(second.body).toEqual({
      message: "Facility ID already exists",
    });
  });

  // 5. Unsuccessful – server error
  it("POST /api/facility should return 500 on server error", async () => {
    const spy = jest
      .spyOn(require("fs").promises, "readFile")
      .mockRejectedValueOnce(new Error("Disk failure"));

    const res = await agent.post("/api/facility").send({
      facility_id: `ERR${Date.now().toString().slice(-7)}`,
      facility_name: "Tennis Court",
      location: "Block 9",
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "Server error adding facility",
    });

    spy.mockRestore();
  });

  // 6. Edge case – ENOENT file handling
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

  // 7. Unsuccessful – opening hours validation
  it("POST /api/facility should return 400 when openinghours format is invalid", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-106",
      facility_name: "Gym",
      location: "Block 4",
      openinghours: "10am - 10pm",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)",
    });
  });

  it("POST /api/facility should return 400 when openinghours start time is later than end time", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-107",
      facility_name: "Gym",
      location: "Block 4",
      openinghours: "22:00 - 10:00",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Opening Hours start time must be earlier than end time",
    });
  });

  it("POST /api/facility should return 400 when openinghours has invalid time values", async () => {
    const res = await agent.post("/api/facility").send({
      facility_id: "API-108",
      facility_name: "Gym",
      location: "Block 4",
      openinghours: "24:00 - 10:00",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "Opening Hours has invalid time values (00:00 to 23:59 only)",
    });
  });
});
