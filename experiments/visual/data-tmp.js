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
      "id": "successful-bed",
      "model": "AcceptRobot"
    }
  },
  {
    "data": {
      "id": "seemly-maid",
      "source": "testSTART",
      "target": "successful-bed"
    }
  },
  {
    "data": {
      "id": "vague-answer",
      "model": "BoxValidationRobot"
    }
  },
  {
    "data": {
      "id": "frightening-mist",
      "source": "successful-bed",
      "target": "vague-answer"
    }
  },
  {
    "data": {
      "id": "heavenly-relation",
      "model": "BranchRobot"
    }
  },
  {
    "data": {
      "id": "nondescript-garden",
      "source": "vague-answer",
      "target": "heavenly-relation"
    }
  },
  {
    "data": {
      "id": "swift-coal",
      "model": "AcceptRobot"
    }
  },
  {
    "data": {
      "id": "valuable-downtown",
      "source": "heavenly-relation",
      "target": "swift-coal"
    }
  },
  {
    "data": {
      "id": "nonchalant-spring",
      "model": "GeneralPurposeRobot"
    }
  },
  {
    "data": {
      "id": "lacking-berry",
      "source": "swift-coal",
      "target": "nonchalant-spring"
    }
  },
  {
    "data": {
      "id": "awful-shape",
      "source": "nonchalant-spring",
      "target": "heavenly-relation"
    }
  },
  {
    "data": {
      "id": "small-beginner",
      "model": "BoxValidationRobot"
    }
  },
  {
    "data": {
      "id": "voracious-digestion",
      "source": "heavenly-relation",
      "target": "small-beginner"
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
      "id": "bumpy-honey",
      "source": "small-beginner",
      "target": "testEND"
    }
  }
]