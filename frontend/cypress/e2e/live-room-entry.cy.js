describe("live room entry", () => {
  const token =
    "header.eyJzdWIiOiJ0ZXN0QGNpcmNsZXVwLmNvbSJ9.signature";

  it("opens the live room screen from the rooms page", () => {
    cy.intercept("GET", "http://localhost:8080/rooms/", [
      {
        id: "room_001",
        title: "Realtime Circle",
        topicId: "topic_001",
        visibility: "public",
        ownerEmail: "test@circleup.com"
      }
    ]).as("listRooms");

    cy.intercept("GET", "http://localhost:8080/topics/", [
      { id: "topic_001", name: "WebRTC" }
    ]).as("listTopics");

    cy.intercept("GET", "http://localhost:8080/rooms/room_001", {
      id: "room_001",
      title: "Realtime Circle",
      topicId: "topic_001",
      visibility: "public",
      ownerEmail: "test@circleup.com"
    }).as("getRoom");

    cy.visit("/rooms", {
      onBeforeLoad(win) {
        win.localStorage.setItem("circleup_token", token);

        Object.defineProperty(win.HTMLMediaElement.prototype, "srcObject", {
          configurable: true,
          get() {
            return this._srcObject || null;
          },
          set(value) {
            this._srcObject = value;
          }
        });

        class FakeWebSocket {
          static OPEN = 1;

          constructor() {
            this.readyState = 1;
            setTimeout(() => {
              this.onopen?.();
              this.onmessage?.({
                data: JSON.stringify({
                  type: "snapshot",
                  snapshot: {
                    participants: [
                      {
                        email: "test@circleup.com",
                        micOn: true,
                        camOn: true,
                        joinedAt: new Date().toISOString()
                      }
                    ],
                    messages: []
                  }
                })
              });
            }, 0);
          }

          send() {}

          close() {
            this.onclose?.();
          }
        }

        Object.defineProperty(win, "WebSocket", {
          value: FakeWebSocket,
          configurable: true
        });

        Object.defineProperty(win.navigator, "mediaDevices", {
          value: {
            enumerateDevices: () =>
              Promise.resolve([
                { kind: "audioinput", deviceId: "audio-1", label: "Mic" },
                { kind: "videoinput", deviceId: "video-1", label: "Cam" }
              ]),
            getUserMedia: () =>
              Promise.resolve(new win.MediaStream())
          },
          configurable: true
        });
      }
    });

    cy.wait("@listRooms");
    cy.wait("@listTopics");

    cy.contains("Join live room").click();

    cy.url().should("include", "/rooms/room_001/live");
    cy.wait("@getRoom");
    cy.contains("Live room").should("be.visible");
    cy.contains("Realtime Circle").should("be.visible");
    cy.contains(/Connection:/).should("be.visible");
    cy.contains(/participant/i).should("be.visible");
  });
});
