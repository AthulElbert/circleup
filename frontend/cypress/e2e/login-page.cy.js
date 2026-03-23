describe("login page", () => {
  it("lets the user type into the login form", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("test@circleup.com");
    cy.get('input[name="password"]').type("pass123");
    cy.contains("Sign in").should("be.visible");
  });
});
