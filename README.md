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
1. Clone the repo.
2. Create a `.env` file based on your environment (see `.env` example below).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

### Environment Variables
Create a `.env` file in the root:
```env
VITE_API_TARGET=http://your-sfc-api-ip
VITE_DEFAULT_STATION_ID=your-station-id
VITE_DEFAULT_PROJECT=your-project
VITE_DEFAULT_EMP_NO=your-employee-no
VITE_DEFAULT_MODEL_NAME=your-model-name
```
> Note: The application proxies requests to `/SFCAPI` to avoid CORS issues locally.

## License
[Your License Here]
