describe("auth flow", () => {
  const token = "header.eyJzdWIiOiJ0ZXN0QGNpcmNsZXVwLmNvbSJ9.signature";

  it("requests an otp, verifies the account, and logs in", () => {
    cy.intercept("POST", "http://localhost:8080/auth/request-otp", {
      statusCode: 200,
      body: { message: "otp sent", otp: "654321" }
    }).as("requestOtp");

    cy.intercept("POST", "http://localhost:8080/auth/verify-otp", {
      statusCode: 200,
      body: { message: "verified" }
    }).as("verifyOtp");

    cy.intercept("POST", "http://localhost:8080/auth/login", {
      statusCode: 200,
      body: { token }
    }).as("login");

    cy.visit("/signup");
    cy.contains("Sign up").should("be.visible");
    cy.get('input[name="email"]').type("test@circleup.com");
    cy.contains("Request OTP").click();
    cy.wait("@requestOtp").its("request.body").should((body) => {
      expect(body).to.deep.equal({ email: "test@circleup.com" });
    });
    cy.contains("OTP sent successfully.").should("be.visible");

    cy.visit("/verify");
    cy.get('input[name="email"]').type("test@circleup.com");
    cy.get('input[name="otp"]').type("654321");
    cy.get('input[name="password"]').type("pass123");
    cy.get("form").contains("button", "Verify").click();
    cy.wait("@verifyOtp");
    cy.contains("OTP verified. Account activated.").should("be.visible");

    cy.visit("/login");
    cy.get('input[name="email"]').type("test@circleup.com");
    cy.get('input[name="password"]').type("pass123");
    cy.get("form").contains("button", "Sign in").click();
    cy.wait("@login");

    cy.url().should("include", "/topics");
    cy.contains("Topics").should("be.visible");
    cy.contains("test@circleup.com").should("be.visible");
    cy.contains("Logout").should("be.visible");
  });
});
