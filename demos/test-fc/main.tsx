import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [num, setNum] = useState(100);

	return (
		<ul
			onClickCapture={() => {
				setNum((num) => num + 1);
				setNum((num) => num + 1);
				setNum((num) => num + 1);
			}}
		>
			<li>{num}</li>
		</ul>
	);
}
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
);
