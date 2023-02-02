#!/usr/bin/env node

import { init } from "./index.js";

console.log(`Running in ${process.env.NODE_ENV}`);

init();
