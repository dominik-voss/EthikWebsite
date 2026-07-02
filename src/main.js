import './style.css';
import { initStory } from './storytelling/scrollStory.js';
import { initCharts } from './charts/charts.js';
import { initMilestones } from './milestones/milestones.js';


async function start() {

    const response = await fetch(import.meta.env.BASE_URL + 'data/umfrage.csv');

    const csv = await response.text();

    initStory(csv);
    initCharts(csv);
    initMilestones(csv);
}


start();