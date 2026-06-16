import './style.css';
import { initStory } from './storytelling/scrollStory.js';

async function start() {

    const response =
        await fetch('/data/umfrage.csv');

    const csv =
        await response.text();

    initStory(csv);
}

start();
