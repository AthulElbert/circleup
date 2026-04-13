describe("live room chat", () => {
  const token =
    "header.eyJzdWIiOiJ0ZXN0QGNpcmNsZXVwLmNvbSJ9.signature";

  it("sends a chat message from the live room screen", () => {
    cy.intercept("GET", "http://localhost:8080/rooms/room_001", {
      id: "room_001",
      title: "Realtime Circle",
      topicId: "topic_001",
      visibility: "public",
      ownerEmail: "test@circleup.com"
    }).as("getRoom");

    cy.intercept("GET", "http://localhost:8080/topics/", [
      { id: "topic_001", name: "WebRTC" }
    ]).as("listTopics");

    cy.visit("/rooms/room_001/live", {
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

          send(payload) {
            const parsed = JSON.parse(payload);
            if (parsed.type === "chat") {
              this.onmessage?.({
                data: JSON.stringify({
                  type: "chat",
                  message: {
                    id: "msg_001",
                    senderEmail: "test@circleup.com",
                    body: parsed.body,
                    sentAt: new Date().toISOString()
                  }
                })
              });
            }
          }

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
            getUserMedia: () => Promise.resolve(new win.MediaStream())
          },
          configurable: true
        });
      }
    });

    cy.wait("@getRoom");
    cy.wait("@listTopics");

    cy.get('textarea[placeholder="Type a message to everyone in this room"]')
      .type("Hello from Cypress");

    cy.contains("Send message").click();

    cy.contains("Hello from Cypress").should("be.visible");
    cy.contains("test@circleup.com").should("be.visible");
  });
});
