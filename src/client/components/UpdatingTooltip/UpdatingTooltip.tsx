import React, { useEffect } from 'react';
import { Tooltip } from 'react-bootstrap';

const UpdatingTooltip = React.forwardRef(
	({ popper, children, ...props }: any, ref) => {
		useEffect(() => {
			popper.scheduleUpdate();
		}, [ children, popper ]);

		return (
			<Tooltip ref={ref} {...props}>
				{children}
			</Tooltip>
		);
	}
);

UpdatingTooltip.displayName = 'UpdatingTooltip';

export default UpdatingTooltip;
