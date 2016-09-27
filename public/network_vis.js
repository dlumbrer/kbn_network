import "plugins/network_vis/network_vis.less";
import 'plugins/network_vis/network_vis_controller';
import 'plugins/network_vis/network_vis_params';
import TemplateVisTypeTemplateVisTypeProvider from 'ui/template_vis_type/template_vis_type';
import VisSchemasProvider from 'ui/vis/schemas';
import networkVisTemplate from 'plugins/network_vis/network_vis.html';


// we need to load the css ourselves

// we also need to load the controller and used by the template


// our params are a bit complex so we will manage them with a directive


// require the directives that we use as well


// register the provider with the visTypes registry
require('ui/registry/vis_types').register(NetworkVisTypeProvider);

// define the TableVisType
function NetworkVisTypeProvider(Private) {
  const TemplateVisType = Private(TemplateVisTypeTemplateVisTypeProvider);
  const Schemas = Private(VisSchemasProvider);

  // return the visType object, which kibana will use to display and configure new
  // Vis object of this type.
  return new TemplateVisType({
    name: 'network',
    title: 'Network',
    icon: 'fa-cogs',
    description: 'Displays a network node that link two fields that have been selected.',
    template: networkVisTemplate,
    params: {
      defaults: {
        showLabels: true,
        showPopup: false,
        showColorLegend: true,
        nodeNode: true,
        firstNodeColor: '#FD7BC4',
        secondNodeColor: '#00d1ff',
        canvasBackgroundColor: 'white',
        shapeFirstNode: 'dot',
        shapeSecondNode: 'box',
        maxCutMetricSizeNode: 5000,
        maxCutMetricSizeEdge: 5000,
        maxNodeSize: 80,
        minNodeSize: 8,
        maxEdgeSize: 20,
        minEdgeSize: 0.1
      },
      editor: '<network-vis-params></network-vis-params>'
    },

    ////////MIRAR THIS
    hierarchicalData: function (vis) {
      return true;
    },
    ////////////////////

    schemas: new Schemas([
      {
        group: 'metrics',
        name: 'size_node',
        title: 'Node Size',
        max: 1
        /*
        defaults: [
          { type: 'count', schema: 'metric' }
        ]
        */
        //aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
      },
      {
        group: 'metrics',
        name: 'size_edge',
        title: 'Edge Size',
        max: 1,
      },
      {
        group: 'buckets',
        name: 'first',
        icon: 'fa fa-circle-thin',
        title: 'Node',
        min: 1,
        max: 2,
        aggFilter: ['terms']//Only have sense choose terms
      },
      {
        group: 'buckets',
        name: 'second',
        icon: 'fa fa-random',
        title: 'Relation',
        max: 1,
        aggFilter: ['terms']
      },
      {
        group: 'buckets',
        name: 'colornode',
        icon: 'fa fa-paint-brush',
        title: 'Node Color',
        max: 1,
        aggFilter: ['terms']
      }
    ])
  });
}

export default NetworkVisTypeProvider;
