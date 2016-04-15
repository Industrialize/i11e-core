class VisitorRegistry {
  constructor() {
    this.registry = {
      robot: [],
      pipeline: [],
      factory: []
    };
  }

  register(visitor) {
    const type = visitor.getType();
    if (type !== 'robot' && type !== 'pipeline' && type != 'factory') {
      console.warn(`Unknow visitor type: ${type}`);
      return;
    }
    this.registry[type].push(visitor);
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
}

module.exports = VisitorRegistry;
