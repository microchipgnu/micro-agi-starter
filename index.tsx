/** @jsxImportSource ai-jsx */
import * as AI from "ai-jsx";
import Agent from "micro-agi/core/components/agent";
import Task from "micro-agi/core/components/task";
import Team from "micro-agi/core/components/team";

const App = async ({ topic }: { topic: string }) => {
  return (
    <Team process="sequential">
      <Agent
        agentType="mrkl"
        role="Writer"
        goal="Write articles about a topic"
        backstory="You are a very experienced writer. You've written thousands of article in your career."
        model="mistral"
        provider="ollama"
      >
        <Task
          onStart={async () => {
            console.log("Started writing article about", topic);
          }}
          onDone={async () => {
            console.log("Done writing article about", topic);
          }}
        >
          Write an article about {topic}. Your result in markdown format.
        </Task>
      </Agent>
    </Team>
  );
};

const renderContext = AI.createRenderContext();
const result = await renderContext.render(<App topic="Apple" />);
await Bun.write(`./result.json`, result);
