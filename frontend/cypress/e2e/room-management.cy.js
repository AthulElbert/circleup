describe("room management flow", () => {
  const token = "header.eyJzdWIiOiJ0ZXN0QGNpcmNsZXVwLmNvbSJ9.signature";

  it("creates a topic, creates a room, generates an invite, and joins by invite", () => {
    const topics = [];
    const rooms = [];

    cy.intercept("GET", "http://localhost:8080/topics/", (req) => {
      req.reply({ statusCode: 200, body: topics });
    }).as("listTopics");

    cy.intercept("POST", "http://localhost:8080/topics/", (req) => {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const topic = { id: `topic_${topics.length + 1}`, name: body.name };
      topics.push(topic);
      req.reply({ statusCode: 201, body: topic });
    }).as("createTopic");

    cy.intercept("GET", "http://localhost:8080/rooms/", (req) => {
      req.reply({ statusCode: 200, body: rooms });
    }).as("listRooms");

    cy.intercept("POST", "http://localhost:8080/rooms/", (req) => {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const room = {
        id: `room_${rooms.length + 1}`,
        title: body.title,
        topicId: body.topicId,
        visibility: body.visibility,
        ownerEmail: "test@circleup.com"
      };
      rooms.push(room);
      req.reply({ statusCode: 201, body: room });
    }).as("createRoom");

    cy.intercept("POST", "http://localhost:8080/invites/generate", (req) => {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const room = rooms.find((item) => item.id === body.roomId);
      room.inviteCode = "INV-ROOM1";
      req.reply({ statusCode: 201, body: { code: room.inviteCode } });
    }).as("generateInvite");

    cy.intercept("GET", /http:\/\/localhost:8080\/rooms\/room_\d+$/, (req) => {
      const roomId = req.url.split("/").pop();
      const room = rooms.find((item) => item.id === roomId);
      req.reply({ statusCode: 200, body: room });
    }).as("getRoom");

    cy.intercept("POST", "http://localhost:8080/invites/join", (req) => {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const room = rooms.find((item) => item.inviteCode === body.code);
      req.reply({ statusCode: 200, body: room });
    }).as("joinInvite");

    cy.visit("/topics", {
      onBeforeLoad(win) {
        win.localStorage.setItem("circleup_token", token);
      }
    });

    cy.wait("@listTopics");
    cy.get('input[placeholder="Topic name"]').type("System Design");
    cy.get("form").contains("button", "Create Topic").click();
    cy.wait("@createTopic").its("request.body").should((body) => {
      const payload = typeof body === "string" ? JSON.parse(body) : body;
      expect(payload).to.deep.equal({ name: "System Design" });
    });
    cy.wait("@listTopics");
    cy.contains("System Design").should("be.visible");

    cy.visit("/rooms/create");
    cy.wait("@listTopics");
    cy.get('input[placeholder="Room title"]').type("Interview Prep");
    cy.get("select").eq(0).select("topic_1");
    cy.get("select").eq(1).select("private");
    cy.get("form").contains("button", "Create Room").click();
    cy.wait("@createRoom");
    cy.contains("Room created: room_1").should("be.visible");

    cy.visit("/rooms");
    cy.wait("@listRooms");
    cy.wait("@listTopics");
    cy.contains("Interview Prep").should("be.visible");
    cy.contains("Topic: System Design").should("be.visible");
    cy.contains("button", "Generate Invite").click();
    cy.wait("@generateInvite");
    cy.contains("Invite: INV-ROOM1").should("be.visible");

    cy.contains("View details").click();
    cy.wait("@getRoom");
    cy.contains("Detailed view for this circle.").should("be.visible");
    cy.contains("Invite Code").should("be.visible");
    cy.contains("INV-ROOM1").should("be.visible");

    cy.visit("/rooms/join");
    cy.wait("@listTopics");
    cy.get('input[placeholder="INV-XXXXXX"]').type("INV-ROOM1");
    cy.get("form").contains("button", "Join Room").click();
    cy.wait("@joinInvite");
    cy.contains("Joined: Interview Prep").should("be.visible");
    cy.contains("Topic: System Design").should("be.visible");
  });
});
