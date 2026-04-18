describe("live room moderation", () => {
  const token = "header.eyJzdWIiOiJob3N0QGNpcmNsZXVwLmNvbSJ9.signature";

  it("shows host controls and applies mute/remove events", () => {
    cy.viewport(900, 900);

    cy.intercept("GET", "http://localhost:8080/rooms/room_001", {
      id: "room_001",
      title: "Moderated Circle",
      topicId: "topic_001",
      visibility: "private",
      ownerEmail: "host@circleup.com"
    }).as("getRoom");

    cy.intercept("GET", "http://localhost:8080/topics/", [
      { id: "topic_001", name: "System Design" }
    ]).as("listTopics");

    cy.visit("/rooms/room_001/live", {
      onBeforeLoad(win) {
        win.localStorage.setItem("circleup_token", token);

        Object.defineProperty(win.HTMLMediaElement.prototype, "srcObject", {
          configurable: true,
          get() { return this._srcObject || null; },
          set(value) { this._srcObject = value; }
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
                        email: "host@circleup.com",
                        role: "host",
                        micOn: true,
                        camOn: true,
                        muted: false,
                        joinedAt: new Date().toISOString()
                      },
                      {
                        email: "guest@circleup.com",
                        role: "participant",
                        micOn: true,
                        camOn: true,
                        muted: false,
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
            if (parsed.type === "moderation" && parsed.action === "mute") {
              this.onmessage?.({
                data: JSON.stringify({
                  type: "moderation",
                  action: "muted",
                  participant: {
                    email: parsed.toEmail,
                    role: "participant",
                    micOn: false,
                    camOn: true,
                    muted: true,
                    joinedAt: new Date().toISOString()
                  }
                })
              });
            }
            if (parsed.type === "moderation" && parsed.action === "kick") {
              this.onmessage?.({
                data: JSON.stringify({
                  type: "presence",
                  action: "left",
                  participant: { email: parsed.toEmail }
                })
              });
            }
          }
          close() { this.onclose?.(); }
        }

        Object.defineProperty(win, "WebSocket", { value: FakeWebSocket, configurable: true });
        Object.defineProperty(win.navigator, "mediaDevices", {
          value: {
            enumerateDevices: () => Promise.resolve([
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
    cy.contains("Host controls enabled").should("be.visible");
    cy.contains("guest@circleup.com").should("be.visible");
    cy.contains("Mute").click();
    cy.contains("Muted by host").should("be.visible");
    cy.contains("Remove").click();
    cy.contains("guest@circleup.com").should("not.exist");
  });
});
