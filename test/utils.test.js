const fs = require("fs").promises;
const { addFacility } = require("../utils/XavierUtil");

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock("../models/Facility", () => ({
  Facility: function Facility(data) {
    return data;
  },
}));

describe("Unit Tests for Facility Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Successful case – valid facility added
  it("addFacility should add a facility and return 201", async () => {
    fs.readFile.mockResolvedValueOnce(JSON.stringify([]));
    fs.writeFile.mockResolvedValueOnce();

    const req = {
      body: {
        facility_id: "FAC-001",
        facility_name: "Badminton Court",
        description: "Beat some shuttlecocks today!",
        location: "Block 3",
        openinghours: "10:00 - 22:00"
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

  // 2. Unsuccessful – missing required fields
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

  it("addFacility should return 400 if location is missing", async () => {
    const req = {
      body: {
        facility_id: "FAC-002",
        facility_name: "Badminton Court",
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

  // 3. Unsuccessful – character length validation
  it("addFacility should return 400 if facility_id exceeds 10 characters", async () => {
    const req = {
      body: {
        facility_id: "FAC-123456789",
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
      message: "Facility ID must not exceed 10 characters",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("addFacility should return 400 if facility_name exceeds 25 characters", async () => {
    const req = {
      body: {
        facility_id: "FAC-004",
        facility_name: "This facility name is over twenty five",
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
      message: "Facility name must not exceed 25 characters",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("addFacility should return 400 if location exceeds 25 characters", async () => {
    const req = {
      body: {
        facility_id: "FAC-005",
        facility_name: "Gym",
        location: "This location is definitely over twenty five",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Facility location must not exceed 25 characters",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  // 4. Unsuccessful – duplicate Facility ID
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

  // 5. Unsuccessful – server / file errors
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

  // 6. Edge case – ENOENT file treated as empty
  it("addFacility should treat ENOENT as empty file and still create facility", async () => {
    const err = new Error("File not found");
    err.code = "ENOENT";

    fs.readFile.mockRejectedValueOnce(err);
    fs.writeFile.mockResolvedValueOnce();

    const req = {
      body: {
        facility_id: "FAC-010",
        facility_name: "Tennis Court",
        location: "Block 2",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(fs.writeFile).toHaveBeenCalled();
  });

  // 7. Unsuccessful – opening hours validation
  it("addFacility should return 400 if openinghours start time is later than end time", async () => {
    const req = {
      body: {
        facility_id: "FAC-OH-1",
        facility_name: "Gym",
        location: "Block 1",
        openinghours: "22:00 - 10:00",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Opening Hours start time must be earlier than end time",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("addFacility should return 400 for invalid openinghours time values", async () => {
    const req = {
      body: {
        facility_id: "FAC-OH-BAD",
        facility_name: "Gym",
        location: "Block 1",
        openinghours: "24:00 - 10:00",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Opening Hours has invalid time values (00:00 to 23:59 only)",
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("addFacility should return 400 if openinghours format is invalid", async () => {
    const req = {
      body: {
        facility_id: "FAC-OH-FMT",
        facility_name: "Gym",
        location: "Block 1",
        openinghours: "10am to 10pm"
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await addFacility(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)"
    });

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
