import { APP_NAME } from "@orbi/shared";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>{APP_NAME}</h1>
      <p>Personal AI Study Coach</p>
    </main>
  );
}
