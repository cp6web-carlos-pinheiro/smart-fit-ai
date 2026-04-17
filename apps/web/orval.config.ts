import { defineConfig } from "orval";
import "dotenv/config";

export default defineConfig({
  fetch: {
    input: {
      target: `${process.env.NEXT_PUBLIC_API_URL}/swagger.json`,      
    },
    output: {
      target: "./src/app/_lib/api/fetch-generated.ts",  
      client: "fetch",
      prettier: true,
      baseUrl: "/api",                                 

      override: {
        mutator: {
          path: "./src/app/_lib/fetch.ts",              
          name: "customFetch",
        },
      },
    },
  },
});