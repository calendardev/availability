import React from "react";
import Availability from "./Availability.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full">
        <Availability />
      </div>
    </QueryClientProvider>
  );
}

export default App;
