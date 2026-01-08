describe("Cypress Full-Stack Tests – Add Facility Feature", () => {

  beforeEach(() => {
    cy.session("admin-session", () => {
      cy.request("POST", "http://localhost:5050/api/login", {
        email: "admin@silversea.com",
        password: "test",
        role: "admin",
      });
    });

    cy.visit("http://localhost:5050/xavier.html");
  });

  it("successfully adds a new facility via admin UI", () => {
    const validId = "CYP1001"; // <= 10 chars

    cy.get("#facilityId").type(validId);
    cy.get("#facilityName").type("Cypress Gym");
    cy.get("#facilityLocation").type("Block 10");

    cy.contains("button", "Add Facility").click();

    cy.on("window:alert", (text) => {
      expect(text).to.contain("Facility added successfully");
    });
  });

  it("shows validation error when facility ID exceeds limit", () => {
    cy.get("#facilityId").type("CYP-123456789"); // too long
    cy.get("#facilityName").type("Invalid Facility");
    cy.get("#facilityLocation").type("Block 10");

    cy.contains("button", "Add Facility").click();

    cy.on("window:alert", (text) => {
      expect(text).to.contain("Facility ID must not exceed 10 characters");
    });
  });

  it("shows validation error when required fields are missing", () => {
    cy.get("#facilityName").type("Missing ID");
    cy.contains("button", "Add Facility").click();

    cy.on("window:alert", (text) => {
      expect(text).to.contain("Facility ID is required");
    });
  });

  it("rejects duplicate facility ID via API", () => {
    const payload = {
      facility_id: "CYPDUP01",
      facility_name: "Duplicate Court",
      location: "Block 9",
    };

    cy.request("POST", "http://localhost:5050/api/facility", payload)
      .its("status")
      .should("be.oneOf", [200, 201]);

    cy.request({
      method: "POST",
      url: "http://localhost:5050/api/facility",
      body: payload,
      failOnStatusCode: false,
    }).its("status").should("eq", 409);
  });

});
