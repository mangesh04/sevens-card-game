import React from 'react';
import './card.css';
import { useRef } from 'react';
// ️♥️♦️♠️♣️

export default function Card(prop) {

    const suitesMap = ['♠️', '♥️️', '♣️', '♦️'];


    return (
        <> <div className={'card ' + (prop.shadow && 'shadow')} onClick={prop.onClick}>
            <h2> {prop.value}{suitesMap[prop.suiteIndex]} </h2>
        </div>
        </>
    );
}