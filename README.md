# SFC Search Tool (Google-Style)
A modern, "Google-style" search interface for Shopfloor Control (SFC) configuration and route data.

## Features
- **Sleek UI**: Clean, single-input search bar with "I'm Feeling Lucky" easter eggs.
- **Visualizations**:
  - **Rack View**: 48U rack elevation with auto-mapped components (Compute, Switch, Power, Mgmt).
  - **Front/Rear Toggle**: Visualize Manifolds and Cable Cartridges in the rear view.
  - **Interactive Tooltips**: Detailed component info including PNs, SNs, Revisions, and formatted MAC addresses.
- **Search History**: Persisted history sidebar for quick access to previous queries.
- **Data Rendering**:
  - Consolidates complex hardware (ConnectX, E1.S SSDs) into readable tiles.
  - Hides empty/N/A fields automatically.
  - Formats Route Status codes (e.g., `R_FTS` -> "Repair at FTS").

## Development
This project uses React, Vite, TailwindCSS, and Framer Motion.

### Setup
1. **Prerequisite**: Ensure you are connected to the corporate VPN or network to access the SFC API (`10.16.137.111`).
2. Clone the repo.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run locally:
   ```bash
   npm run dev
   ```
   Open the link shown in the terminal (usually `http://localhost:5173`).

### Environment Variables
Optionally create a `.env` file to override defaults:
```env
VITE_API_TARGET=http://10.16.137.111
# Add other overrides if needed
```
> **Note**: The application proxies requests from `/SFCAPI` to the configured `VITE_API_TARGET`. This proxy works locally via `vite` and can be configured for deployment, but the backend server must be reachable from the host.

## License
[Your License Here]
