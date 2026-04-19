describe("live room muted state", () => {
  const token = "header.eyJzdWIiOiJndWVzdEBjaXJjbGV1cC5jb20ifQ.signature";

  it("locks the microphone toggle when the current user is muted by the host", () => {
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
                        email: "host@circleup.com",
                        micOn: true,
                        camOn: true,
                        muted: false,
                        isHost: true,
                        joinedAt: new Date().toISOString()
                      },
                      {
                        email: "guest@circleup.com",
                        micOn: false,
                        camOn: true,
                        muted: true,
                        isHost: false,
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
            getUserMedia: () => Promise.resolve(new win.MediaStream())
          },
          configurable: true
        });
      }
    });

    cy.wait("@getRoom");
    cy.wait("@listTopics");

    cy.contains("Muted by host").should("be.visible");
    cy.contains("button", "Muted by host").should("be.disabled");
    cy.contains("Your broadcast state: mic off, camera on").should("be.visible");
  });
});
