var visualdata = [
  {
    "data": {
      "id": "testSTART",
      "model": "testSTART"
    },
    "position": {
      "x": 50,
      "y": 50
    },
    "classes": "start-node"
  },
  {
    "data": {
      "id": "gratis-effect",
      "model": "AcceptRobot"
    }
  },
  {
    "data": {
      "id": "painful-slip",
      "source": "testSTART",
      "target": "gratis-effect"
    }
  },
  {
    "data": {
      "id": "next-action",
      "model": "BoxValidationRobot"
    }
  },
  {
    "data": {
      "id": "high-pitched-table",
      "source": "gratis-effect",
      "target": "next-action"
    }
  },
  {
    "data": {
      "id": "incompetent-stick",
      "model": "BranchRobot"
    }
  },
  {
    "data": {
      "id": "ad-print",
      "source": "next-action",
      "target": "incompetent-stick"
    }
  },
  {
    "data": {
      "id": "aloof-sack",
      "model": "AcceptRobot"
    }
  },
  {
    "data": {
      "id": "handsome-branch",
      "source": "incompetent-stick",
      "target": "aloof-sack"
    }
  },
  {
    "data": {
      "id": "taboo-chairs",
      "model": "GeneralPurposeRobot"
    }
  },
  {
    "data": {
      "id": "busy-bell",
      "source": "aloof-sack",
      "target": "taboo-chairs"
    }
  },
  {
    "data": {
      "id": "grandiose-river",
      "source": "taboo-chairs",
      "target": "incompetent-stick"
    }
  },
  {
    "data": {
      "id": "dazzling-juice",
      "model": "BoxValidationRobot"
    }
  },
  {
    "data": {
      "id": "anxious-driving",
      "source": "incompetent-stick",
      "target": "dazzling-juice"
    }
  },
  {
    "data": {
      "id": "testEND",
      "model": "testEND"
    },
    "position": {
      "x": 50,
      "y": 650
    },
    "classes": "end-node"
  },
  {
    "data": {
      "id": "robust-slope",
      "source": "dazzling-juice",
      "target": "testEND"
    }
  }
]