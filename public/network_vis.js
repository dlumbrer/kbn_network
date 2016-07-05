  import "plugins/network_vis/network_vis.less";
  import 'plugins/network_vis/network_vis_controller';
  import 'plugins/network_vis/network_vis_params';
  import 'ui/agg_table';
  import 'ui/agg_table/agg_table_group';
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

    // define the TableVisController which is used in the template
    // by angular's ng-controller directive

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
          showAuthorRepoRelationship : true,
          showAuthorSameRepoRelationship: false,
          showRepoSameAuthorRelationship: false,
          firstNodeColor: 'blue',
          secondNodeColor: 'green',
          shapeFirstNode: 'dot',
          shapeSecondNode: 'box'
        },
        editor: '<network-vis-params></network-vis-params>'
      },

      hierarchicalData: function (vis) {
        return true;
      },
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
          //aggFilter: ['count']//, 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
        },
        {
          group: 'metrics',
          name: 'size_edge',
          title: 'Edge Size',
          max: 1,
          //aggFilter: ['count']//, 'avg', 'sum', 'min', 'max', 'cardinality', 'std_dev']
        },
        {
          group: 'buckets',
          name: 'first',
          title: 'First field of the Relationship',
          min: 1,
          max: 1,
          aggFilter: ['terms']//Para solo elegir terms
        },
        {
          group: 'buckets',
          name: 'second',
          title: 'Second field of the Relationship',
          min: 1,
          max: 1,
          aggFilter: ['terms']//Para solo elegir terms
        },
        {
          group: 'buckets',
          name: 'colornode',
          title: 'Node Color',
          max: 1,
          aggFilter: ['terms']//Para solo elegir terms
        }
      ])
    });
  }

  export default NetworkVisTypeProvider;
