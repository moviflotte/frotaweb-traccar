import { useMemo } from 'react';

export default (t) => useMemo(() => ({
    dl: {
        name: t('attributeDl'),
        type: 'string',
    },
    dlExpiration: {
        name: t('attributeDlExpiration'),
        type: 'string',
    },
    itin: {
        name: t('attributeItin'),
        type: 'string',
    },
    nic: {
        name: t('attributeNic'),
        type: 'string',
    }
}), [t]);
