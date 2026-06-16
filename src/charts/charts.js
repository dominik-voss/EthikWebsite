import Highcharts from "highcharts";


export function initCharts(config){


const {
container,
data
}=config;



Highcharts.chart(container, {


chart:{
type:"pie"
},


title:{
text:"Umfrageergebnis"
},


series:[{

data:[

{
name:"Gruppe A",
y:60
},

{
name:"Gruppe B",
y:40
}

]

}]


});


}