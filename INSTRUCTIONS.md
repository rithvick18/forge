# AI Instructions & Change Log

This file is maintained by the AI assistant to keep track of ongoing instructions, architectural decisions, and project changes. It serves as a persistent context log for development.

## Project Context
- **Name:** FMCG Consumer Intelligence Platform
- **Goal:** AI-powered system that analyzes Indian consumer behavior via Google Trends to predict purchasing patterns, identify emerging trends, and recommend product innovations for FMCG companies.

## Active Instructions
1. **Maintain Context:** Continually update this file whenever significant architectural changes, new feature implementations, or dependency updates occur.
2. **Backend Development:** Group Python requirements logically to speed up pip installations (e.g., using `install_groups.py`).
3. **Stack Adherence:** Follow the established tech stack—FastAPI (backend), React/Vite (frontend), PostgreSQL (DB), Redis (Cache).

## Change Log
- **2026-03-23:** Created `INSTRUCTIONS.md` to track ongoing AI instructions and changes. Linked this file from `README.md`.
- **2026-03-23:** Designed and executed `install_groups.py` in the backend to intelligently batch-install over 70 Python dependencies, preventing pip dependency resolver timeouts for heavy packages (like PyTorch and Scikit-learn).
- **2026-03-23:** Completely migrated the frontend application from Vanilla JavaScript to TypeScript. Converted all `.js`/`.jsx` files to `.ts`/`.tsx`, added appropriate Vite/TypeScript configurations, typed API payloads and components, and resolved all strict type-checking errors.
