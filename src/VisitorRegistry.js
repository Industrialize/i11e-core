class VisitorRegistry {
  constructor() {
    this.registry = {
      robot: [],
      pipeline: [],
      factory: [],
      transport: []
    };
  }

  register(type, visitor) {
"#if process.env.NODE_ENV !== 'production'";
    if (type !== 'robot' && type !== 'pipeline'
      && type != 'factory' && type !== 'transport') {
      console.warn(`Unknow visitor type: ${type}`);
      return;
    }
    this.registry[type].push(visitor);
"#endif";
  }

  getRobotVisitors() {
    return this.registry.robot;
  }

  getPipelineVisitors() {
    return this.registry.pipeline;
  }

  getFactoryVisitors() {
    return this.registry.factory;
  }

  getTransportVisitors() {
    return this.registry.transport;
  }
}

module.exports = VisitorRegistry;
