const React = require('react');
const ReactDOM = require('react-dom/client');

// import RumpusQuill from '@rumpushub/common-react/dist/components/rumpus_quill';
import RumpusQuill from '@rumpushub/common-react';

export default function Home() {

    const editor_ref = React.useRef(null);
    const [value, setValue] = React.useState('');
    const [quill, setQuill] = React.useState(<RumpusQuill value={value} setValue={setValue} editor_ref={editor_ref} />);

    return (
        <>
            <div><span>Mountjoy UI</span></div>
        </>
    )
}