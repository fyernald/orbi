import { useMemo } from 'react';
import { allTimeZones } from '../time-zones';
import { SelectBox } from './select-box';

type TimeZoneSelectProps = {
	value: string;
	onChange: (zone: string) => void;
};

export function TimeZoneSelect({ value, onChange }: TimeZoneSelectProps) {
	const options = useMemo(() => {
		const all = allTimeZones();
		// some browsers leave a few names, like UTC, out of the list
		const zones = all.includes(value) ? all : [value, ...all];
		return zones.map((zone) => ({
			value: zone,
			label: zone.replaceAll('_', ' '),
		}));
	}, [value]);

	return (
		<SelectBox
			label="Not right? Pick yours"
			value={value}
			options={options}
			order={1}
			onChange={onChange}
		/>
	);
}
