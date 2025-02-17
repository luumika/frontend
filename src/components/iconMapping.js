
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import AgriculturalIcon from '@mui/icons-material/FlightTakeoff';
import AirQualityIcon from '@mui/icons-material/Air'; 
import SmartDoorLockIcon from '@mui/icons-material/Lock'; 
import SmartThermostatIcon from '@mui/icons-material/Thermostat'; 
import HomeIcon from '@mui/icons-material/Home';
import RouterIcon from '@mui/icons-material/Router';
import DataObjectIcon from '@mui/icons-material/DataObject';

const iconMapping = {
    "Umfeld": <HomeIcon />,
    "Gerät": <RouterIcon />,
    "/icons/thermal_room.png": <DeviceThermostatIcon />,
    "/icons/agricultural_drone.png": <AgriculturalIcon />,
    "/icons/air_quality_sensor.png": <AirQualityIcon />,
    "/icons/smart_door_lock.png": <SmartDoorLockIcon />,
    "/icons/smart_thermostat.png": <SmartThermostatIcon />,
    default: <DataObjectIcon />,
};

export default iconMapping;
