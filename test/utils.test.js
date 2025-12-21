const fs = require("fs").promises;
const { addFacility } = require("../utils/XavierUtil");

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe("Unit Tests for Facility Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

// 1. Success Case
    it("addFacility should add a facility and return 201", async () => {
    fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
    fs.writeFile.mockResolvedValueOnce();

    const req = {
      body: {
        facility_id: "FAC-001",
        facility_name: "Badminton Court",
        description: "Beat some shuttlecocks today!",
        location: "Block 3",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    const response = res.json.mock.calls[0][0];
    expect(response.message).toBe("Facility added successfully");
    expect(response.facility.facility_id).toBe("FAC-001");
    expect(response.facility.facility_name).toBe("Badminton Court");

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

// 2. Missing facility_id
    it("addFacility should return 400 if facility_id is missing", async () => {
    const req = {
      body: {
        facility_name: "Badminton Court",
        location: "Block 3",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "facility_id, facility_name and location are required",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

// 3. Missing facility_name
    it("addFacility should return 400 if facility_name is missing", async () => {
    const req = {
      body: {
        facility_id: "FAC-002",
        location: "Block 3",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "facility_id, facility_name and location are required",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

// 4. Missing location
    it("addFacility should return 400 if location is missing", async () => {
    const req = {
      body: {
        facility_id: "FAC-002",
        facility_name: "Badminton Court"
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "facility_id, facility_name and location are required",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

// 5. Duplicate facility_id
    it("addFacility should return 409 if facility_id already exists", async () => {
    const existingFacilities = [
      {
        facility_id: "FAC-003",
        facility_name: "Badminton Court",
        location: "Block 1",
      },
    ];

    fs.readFile.mockResolvedValueOnce(JSON.stringify(existingFacilities));

    const req = {
      body: {
        facility_id: "FAC-003",
        facility_name: "Basketball Court",
        location: "Block 2",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Facility ID already exists",
    });

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

// 6. File read error
    it("addFacility should return 500 if unable to add facility due to server error", async () => {
    fs.readFile.mockRejectedValueOnce(new Error("Disk failure"));

    const req = {
        body: {
        facility_id: "FAC-999",
        facility_name: "Swimming Pool",
        location: "Block 5",
        },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        message: "Server error adding facility",
    });

    expect(fs.writeFile).not.toHaveBeenCalled();
    });
});