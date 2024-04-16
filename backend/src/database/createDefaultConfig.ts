import { DataSource } from "typeorm";
import { Configuration } from "./entities/Configuration";
import { Role } from "./entities/Role";
import { Frequency } from "./entities/Frequency";
import { RoleFrequency } from "./entities/RoleFrequency";


export default async function createDefaultConfig(dataSource: DataSource) {
    const configRepo = dataSource.getRepository(Configuration);
    const roleRepo = dataSource.getRepository(Role);
    const frequencyRepo = dataSource.getRepository(Frequency);
    const roleFrequencyRepo = dataSource.getRepository(RoleFrequency);

    const config = await configRepo.save({ name: 'Default config' });


    const ATC1 = await roleRepo.save({ name: 'OS DIR-E', type: 'ATC', config: config })
    const ATC2 = await roleRepo.save({ name: 'OS ARR-E', type: 'ATC', config: config })
    const ATC3 = await roleRepo.save({ name: 'OS APP-C', type: 'ATC', config: config })
    const ATC4 = await roleRepo.save({ name: 'OS P3', type: 'ATC', config: config })
    const ATC5 = await roleRepo.save({ name: 'SA TWR W', type: 'ATC', config: config })

    const F1 = await frequencyRepo.save({ frequency: '118.505', config: config })
    const F2 = await frequencyRepo.save({ frequency: '126.655', config: config })
    const F3 = await frequencyRepo.save({ frequency: '131.130', config: config })
    const F4 = await frequencyRepo.save({ frequency: '120.505', config: config })

    const RFFR1 = await roleFrequencyRepo.save({ role: ATC1, frequency: F4, order: 1 })
    const RFFR2 = await roleFrequencyRepo.save({ role: ATC2, frequency: F2, order: 2 })
    const RFFR3 = await roleFrequencyRepo.save({ role: ATC4, frequency: F3, order: 3 })
    const RFFR4 = await roleFrequencyRepo.save({ role: ATC5, frequency: F1, order: 4 })

}

/*
const initialRoles: Role[] = [
    { name: 'OS DIR-E', primaryFrequency: '120.505' },
    { name: 'OS ARR-E', primaryFrequency: '126.655' },
    { name: 'OS APP-C', primaryFrequency: '' },
    { name: 'OS P3', primaryFrequency: '131.130' },
    { name: 'SA TWR W', primaryFrequency: '118.505' },
    // Add more as needed
]


// Some hardcoded frequencies
const initialFrequencies: Frequency[] = [
    { id: 1, frequency: '118.505', label: 'SA TWR W' },
    { id: 2, frequency: '126.655', label: 'OS ARR-E' },
    { id: 3, frequency: '131.130', label: 'OS P3' },
    { id: 4, frequency: '120.505', label: 'OS DIR-E' },
    // Add more as needed
]


*/ 