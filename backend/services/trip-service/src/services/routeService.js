// services/routeService.js
const routeRepository = require('../repositories/routeRepository');
const { mapToRouteAdminData, mapToRouteStop } = require('../utils/mappers');
class RouteService {
  async getRouteWithStops(id) {
    const route = await routeRepository.findById(id);
    if (!route) return null;

    // Get route stops (intermediate stops)
    const stops = (await routeRepository.getStopsWithTypes(id)) || [];

    // Get route points (pickup/dropoff points)
    const points = (await routeRepository.getRoutePoints(id)) || [];

    return mapToRouteAdminData(route, stops, points);
  }

  async createRoute(routeData) {
    const newRoute = await routeRepository.create(routeData);
    // Fetch the stops and points that were just inserted
    const stops = (await routeRepository.getStopsWithTypes(newRoute.route_id)) || [];
    const points = (await routeRepository.getRoutePoints(newRoute.route_id)) || [];
    return mapToRouteAdminData(newRoute, stops, points);
  }

  async updateRoute(id, routeData) {
    const updatedRoute = await routeRepository.update(id, routeData);
    if (!updatedRoute) return null;
    const stops = (await routeRepository.getStopsWithTypes(id)) || [];
    const points = (await routeRepository.getRoutePoints(id)) || [];
    return mapToRouteAdminData(updatedRoute, stops, points);
  }

  async deleteRoute(id) {
    return await routeRepository.delete(id);
  }

  async addStopToRoute(routeId, stopData) {
    const newStop = await routeRepository.upsertStop(routeId, stopData);

    await routeRepository.updateOriginDestinationFromStops(routeId);

    return mapToRouteStop(newStop);
  }

  async getAllRoutes(options = {}) {
    const result = await routeRepository.findAll(options);

    // Map each route with its stops and points
    const fullRoutes = [];
    for (const r of result.data) {
      const stops = (await routeRepository.getStopsWithTypes(r.route_id)) || [];
      const points = (await routeRepository.getRoutePoints(r.route_id)) || [];
      fullRoutes.push(mapToRouteAdminData(r, stops, points));
    }

    return {
      data: fullRoutes,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  async getPopularRoutes(limit = 10) {
    const routes = await routeRepository.getPopularRoutes(limit);

    return routes.map((route) => ({
      route_id: route.route_id,
      operator_id: route.operator_id,
      origin: route.origin,
      destination: route.destination,
      distance_km: Number(route.distance_km),
      estimated_minutes: Number(route.estimated_minutes),
      total_trips: Number(route.total_trips || 0),
      starting_price: route.starting_price ? Number(route.starting_price) : null, // có thể null nếu chưa có chuyến
      created_at: route.created_at,
      updated_at: route.updated_at,
    }));
  }
}

module.exports = new RouteService();
