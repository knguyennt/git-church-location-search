# Church Location Search Application

A full-stack GIS application for finding and managing church locations with interactive mapping, search functionality, and proximity-based queries.

## Features

- 🗺️ **Interactive Map**: View churches on an interactive map with clickable markers
- 🔍 **Text Search**: Search churches by name, denomination, or address
- 📍 **Proximity Search**: Find churches within a specified radius of any location
- ➕ **Add Churches**: Add new church locations by clicking on the map or using the form
- ✏️ **Edit Churches**: Update church information including location, contact details, and description
- 🗑️ **Delete Churches**: Remove church entries from the database
- 🌍 **PostGIS Integration**: Efficient spatial queries using PostGIS database extension
- 📊 **Analytics Dashboard**: Metabase integration for data visualization and insights

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Database with PostGIS extension for spatial data
- **SQLAlchemy**: ORM with GeoAlchemy2 for spatial operations
- **Pydantic**: Data validation and serialization

### Frontend
- **React 18**: Modern JavaScript framework
- **Chakra UI**: Component library for clean and responsive design
- **React Leaflet**: Interactive maps integration
- **Axios**: HTTP client for API communication

### Infrastructure
- **Docker**: Containerized deployment
- **Docker Compose**: Multi-service orchestration
- **Metabase**: Business intelligence and data visualization

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd gis-church-location-search
   ```

2. **Start the application**
   ```bash
   # Using the automated setup script (recommended)
   ./setup.sh
   
   # Or manually with Docker Compose
   docker compose up --build -d
   ```

   The setup script will:
   - ✅ Check Docker installation
   - 🔨 Build and start all services
   - 📊 Automatically import church data (if database is empty)
   - 🔍 Verify all services are running
   - 📈 Set up analytics views in the database

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Metabase Analytics: http://localhost:3001

> **Note**: Data import happens automatically when starting with an empty database. The system includes 269+ church locations from Vietnam.

## API Endpoints

### Churches
- `GET /churches` - Get all churches (with pagination)
- `GET /churches/{id}` - Get specific church
- `POST /churches` - Create new church
- `PUT /churches/{id}` - Update church
- `DELETE /churches/{id}` - Delete church

### Search
- `GET /churches/search/text?q={query}` - Text search
- `GET /churches/search/nearby?lat={lat}&lng={lng}&radius={km}` - Proximity search

## Data Structure

Churches contain the following information:
- **Basic Info**: Name, denomination, religion
- **Location**: Latitude, longitude (stored as PostGIS POINT)
- **Contact**: Address, phone, website
- **Metadata**: Description, creation/update timestamps
- **OSM Integration**: Original OpenStreetMap ID (if imported)

## Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/church_locator
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:8000
```

### Database Configuration

The PostgreSQL database includes:
- PostGIS extension for spatial operations
- Spatial indexes for efficient proximity queries
- Automatic timestamp management

## Metabase Analytics

### Setup Metabase
1. Access Metabase at http://localhost:3001
2. Create admin account on first visit
3. Add database connection:
   - **Database type**: PostgreSQL
   - **Host**: `db`
   - **Port**: `5432`
   - **Database**: `church_locator`
   - **Username**: `postgres`
   - **Password**: `postgres`

### Pre-built Analytics Views
- `churches_analytics` - Complete church data with coordinates
- `denomination_stats` - Statistical breakdown by denomination
- `churches_by_region` - Geographic distribution analysis
- `church_additions_by_month` - Growth tracking over time
- `church_density_analysis` - Spatial distribution insights

### Suggested Dashboards
- **Geographic Distribution**: Maps and regional analysis
- **Denominational Insights**: Religious distribution and trends
- **Growth Analytics**: Church additions and expansion patterns
- **Density Analysis**: Coverage and proximity metrics

See `metabase/README.md` for detailed setup instructions and example queries.

## Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Database Access
```bash
# Connect to the database
docker-compose exec db psql -U postgres -d church_locator

# View churches table
\\dt
SELECT name, ST_AsText(location) FROM churches LIMIT 5;
```

## Data Import

The application includes a script to import church data from OpenStreetMap JSON format:

```bash
# Import from data.json
cp data.json backend/
docker-compose exec backend python import_data.py

# Or specify a different file
docker-compose exec backend python import_data.py /path/to/your/data.json
```

## Usage Guide

### Adding Churches
1. Enable "Add Mode" toggle in the header
2. Click anywhere on the map to set coordinates
3. Fill in the church details in the modal
4. Click "Add Church" to save

### Searching Churches
1. **Text Search**: Enter keywords in the search box
2. **Location Search**: 
   - Enter coordinates manually, or
   - Click "Use My Location" to get current position
   - Set search radius
   - Click "Find Nearby Churches"

### Managing Churches
- Click on any church marker to view details
- Use "Edit" button in the popup to modify information
- Use "Delete" option to remove churches

## Spatial Queries

The application uses PostGIS for efficient spatial operations:

- **Point storage**: `GEOMETRY(POINT, 4326)` for WGS84 coordinates
- **Distance calculations**: Spherical distance using projected coordinates
- **Proximity search**: `ST_DWithin` with spatial indexes
- **Coordinate transformations**: Web Mercator (EPSG:3857) for metric calculations

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Ensure PostgreSQL container is running
   - Check DATABASE_URL environment variable

2. **PostGIS extension missing**
   - The init.sql script should create the extension automatically
   - Manually run: `CREATE EXTENSION IF NOT EXISTS postgis;`

3. **Frontend can't connect to backend**
   - Verify REACT_APP_API_URL in frontend environment
   - Check if backend is running on port 8000

4. **Map not loading**
   - Check internet connection for OpenStreetMap tiles
   - Verify Leaflet CSS is loaded

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Open an issue on GitHub
