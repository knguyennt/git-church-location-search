# Metabase Analytics Dashboard

This directory contains configuration and documentation for the Metabase analytics dashboard.

## Access Metabase

Once the services are running, access Metabase at: http://localhost:3001

## Initial Setup

1. **Admin Account**: Create your admin account when first accessing Metabase
2. **Database Connection**: Connect to the PostgreSQL database with these settings:
   - **Host**: `db`
   - **Port**: `5432`
   - **Database**: `church_locator`
   - **Username**: `postgres`
   - **Password**: `postgres`

## Pre-built Views for Analytics

The following database views are automatically created for easy analysis:

### 📊 **churches_analytics**
- Complete church data with longitude/latitude as separate columns
- Perfect for mapping and coordinate-based analysis

### 📈 **denomination_stats** 
- Statistical breakdown of churches by denomination
- Includes count and percentage distribution

### 🗺️ **churches_by_region**
- Groups churches by Vietnamese regions (North, Central, South)
- Shows church count and average coordinates per region

### 🏷️ **churches_with_location**
- Enhanced church data with region labels and display names
- Ideal for geographic analysis and mapping

### 📅 **church_additions_by_month**
- Tracks church additions over time
- Shows growth patterns and denominational trends

### 📏 **church_density_analysis**
- Analyzes distances between nearby churches
- Helps understand church distribution and density

## Suggested Dashboards

### 1. **Church Distribution Overview**
- Map visualization of all churches
- Denomination breakdown pie chart
- Regional distribution bar chart
- Total church count metric

### 2. **Geographic Analysis**
- Churches by region
- Density heatmap
- Distance analysis between churches
- Coverage area analysis

### 3. **Denominational Insights**
- Denomination distribution
- Regional denomination preferences
- Growth by denomination over time

### 4. **Growth & Trends**
- Monthly church additions
- Cumulative growth chart
- New denominations over time
- Regional growth patterns

## Example Queries

### Most Common Denominations
```sql
SELECT denomination, church_count, percentage 
FROM denomination_stats 
WHERE denomination != 'Unknown'
ORDER BY church_count DESC;
```

### Churches in Specific Region
```sql
SELECT display_name, denomination, latitude, longitude
FROM churches_with_location 
WHERE region = 'South Vietnam'
ORDER BY display_name;
```

### Recent Church Additions
```sql
SELECT name, denomination, created_at, latitude, longitude
FROM churches_analytics 
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

### Churches Near Ho Chi Minh City (Example)
```sql
SELECT 
    name, 
    denomination,
    ST_Distance(
        ST_Transform(location, 3857),
        ST_Transform(ST_SetSRID(ST_MakePoint(106.6297, 10.8231), 4326), 3857)
    ) / 1000.0 as distance_km
FROM churches
WHERE ST_DWithin(
    ST_Transform(location, 3857),
    ST_Transform(ST_SetSRID(ST_MakePoint(106.6297, 10.8231), 4326), 3857),
    50000  -- 50km radius
)
ORDER BY distance_km;
```

## Visualization Tips

1. **Maps**: Use longitude/latitude from `churches_analytics` view
2. **Time Series**: Use `church_additions_by_month` for growth charts
3. **Geographic Filters**: Use the `region` field for filtering by area
4. **Pie Charts**: Use `denomination_stats` for distribution analysis
5. **Scatter Plots**: Plot churches by coordinates with denomination colors

## Advanced Features

- **Spatial Queries**: Leverage PostGIS functions for complex geographic analysis
- **Custom Metrics**: Create calculated fields for distance, density, coverage
- **Alerts**: Set up notifications for new church additions
- **Scheduled Reports**: Automate dashboard delivery via email

## Security Notes

- Default credentials are for development only
- Change database passwords in production
- Configure proper access controls for sensitive data
- Consider data anonymization for public dashboards
