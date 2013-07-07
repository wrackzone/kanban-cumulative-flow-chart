
Rally.onReady(function () {
        
    var TIME_PERIOD_IN_MONTHS = 2,
        TIME_PERIOD_IN_MILLIS = 1000 * 60 * 60 * 24 * 30 * TIME_PERIOD_IN_MONTHS;
                

    Ext.define("ProjectCFDCalculator", {
        extend: "Rally.data.lookback.calculator.TimeSeriesCalculator",
        values: ["Ready To Pull","In Dev","Code Review","Accepted","Merged","Released"],

        getDerivedFieldsOnInput : function () { 
            var dfs = [];
        	var fieldName = 'c_KanbanState';
        	var that = this;
			_.each(that.values,function(value) {
				var s = "return snapshot['"+fieldName+"'] == '" + value + "' ? 1 : 0;";
				var fn = new Function("snapshot",s);
    			dfs.push({
        			as : value,
       	   			f : fn
       	   		});
     	    });
			return dfs;
        }
     	,
        getMetrics: function() {
        	var metrics = [];
        	var that = this;
        	_.each(that.values,function(value) {
            	metrics.push({
   	    	   		field : value,
   	    	   		as : value,
   	    	   		f : "sum",
   	    	   		display : "area"
       	   		}); 
        	});
        	return metrics;
        }
    });

    Ext.define('CustomApp', {
        extend: 'Rally.app.App',
        componentCls: 'app',

        launch: function () {
            var today = new Date(),
                timePeriod = new Date(today - TIME_PERIOD_IN_MILLIS);

            this.chartConfig.storeConfig.find['Project'] = this.getContext().getProject().ObjectID;
            this.chartConfig.storeConfig.find['_ValidFrom'] = {
                "$gt": timePeriod.toISOString()
            };
            this.chartConfig.chartConfig.title = {
                text: this.getContext().getProject().Name + " Cumulative Flow Diagram"
            };

            this.add(this.chartConfig);
        },

            chartConfig: {
                xtype: 'rallychart',

                storeConfig: {
                	find : {
                        '_TypeHierarchy': { '$in' : ['HierarchicalRequirement','Defect']},
                        'Children': null

					},
                    fetch: ['c_KanbanState', 'PlanEstimate','ScheduleState']
				},

                calculatorType: 'ProjectCFDCalculator',
                calculatorConfig: {
                },

                chartConfig: {
                    chart: {
                        zoomType: 'xy'
                    },
                    title: {
                        text: 'Cumulative Flow Diagram'
                    },
                    xAxis: {
                        tickmarkPlacement: 'on',
                        tickInterval: 20,
                        title: {
                            text: 'Days'
                        }
                    },
                    yAxis: [
                        {
                            title: {
                                text: 'Count'
                            }
                        }
                    ],
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: true
                            }
                        },
                        area: {
                            stacking: 'normal'
                        }
                    }
                }
            }
        });
});
