import React, { useState } from "react";
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { Conversation } from "./components/cvi/components/conversation";

const App: React.FC = () => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);

  const createConversation = async () => {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_TAVUS_API_KEY || "",
      },
      body: JSON.stringify({
        replica_id: import.meta.env.VITE_REPLICA_ID || "rfe12d8b9597",
        persona_id: import.meta.env.VITE_PERSONA_ID || "pdced222244b",
      }),
    });

    const data = await response.json();
    setConversationUrl(data.conversation_url);
  };

  return (
    <CVIProvider>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#1e1e1e",
          color: "#fff",
          textAlign: "center",
          flexDirection: "column",
          margin: 0,
          padding: 0,
        }}
      >
        <h1 style={{ marginBottom: "1rem" }}>Tavus CVI Integration (Vite)</h1>
        {!conversationUrl ? (
          <button
            onClick={createConversation}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              background: "#6a0dad",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Start Conversation
          </button>
        ) : (
          <div style={{ width: "100%", maxWidth: "800px" }}>
            <Conversation
              conversationUrl={conversationUrl}
              onLeave={() => setConversationUrl(null)}
            />
          </div>
        )}
      </div>
    </CVIProvider>
  );
};

export default App;
