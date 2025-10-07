import React from 'react';
import { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';

export default function Home() {

    const editor_ref = useRef(null);
    const [value, setValue] = useState('');

    return (
        <>
            <div><span>Mountjoy UI</span></div>
        </>
    )
}