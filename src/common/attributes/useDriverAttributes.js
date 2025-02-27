import { useMemo } from 'react';

export default (t) => useMemo(() => ({
    itin: {
        name: t('attributeItin'),
        type: 'string',
    },
    nic: {
        name: t('attributeNic'),
        type: 'string',
    }
}), [t]);
