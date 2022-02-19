import moment from 'moment'
import { MachineryType } from './../../components/MfEquipmentFormDialog.vue'
import { TruckWorkConditionsTypes, TruckWorkConditions } from './../../components/MfBookingFormDialog.vue'
import { WorkingDayTypes } from './../../pages/machinery-job-registry.vue'

export const pageConfig = {
    pageSize    : 'LETTER',
    pageMargins : [ 100, 60, 100, 60 ],
}

const color = '#003249'

export const mfStyles = {
    headerCompanyInfo: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.2,
        color,
    },

    headerObservationTable: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1,
        color,
    },

    dataObservationTable: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'justify',
        lineHeight : 1,
        color,
    },

    headerSignature: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1.3,
        color,
    },

    tableHeader: {
        fontSize   : 9,
        bold       : true,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1,
        color,
    },

    tableData: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'center',
        lineHeight : 1,
        color,
    },

    bodyTitle: {
        fontSize   : 9,
        bold       : false,
        italics    : false,
        alignment  : 'left',
        lineHeight : 1.5,
        color,
    },
}

export const mfTableLayouts = {
    mfBorderedLayout: {
        hLineWidth(i, node) {

            if (i === 0 || i === node.table.body.length)
                return 0.25

            return (i === node.table.headerRows) ? 0 : 0.25

        },

        vLineWidth(i) {

            return 0.25

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },
    },

    mfBodyLayout: {
        hLineWidth(i, node) {

            if (i !== 0 && i <= node.table.body.length)
                return 0.25

            return 0

        },

        vLineWidth(i) {

            return 0

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },

        paddingTop() {

            return 6

        },

        paddingBottom() {

            return -2

        },
    },

    mfBodyHeaderLayout: {
        hLineWidth(i, node) {

            return 0

        },

        vLineWidth(i) {

            return 0

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },

        paddingTop() {

            return 6

        },

        paddingBottom() {

            return -1.5

        },
    },

    mfFullBorderedLayout: {
        hLineWidth(i, node) {

            return 0.25

        },

        vLineWidth(i) {

            return 0.25

        },

        hLineColor(i) {

            return color

        },

        paddingLeft(i) {

            return 4

        },

        paddingRight(i, node) {

            return 4

        },
    },
}

export async function getMachineryJobPdfInBase64( { title, data, download = true, get64 = false } ) {

    return new Promise( (resolve, reject) => {

        const pdfDocGenerator = generateMachineryJobRegistryPdf( { title, data, download } )
        pdfDocGenerator.getBase64( (data) => {

            resolve(data)

        } )

    } )

}

export function generateMachineryJobRegistryPdf( { title, data, download = true, get64 = false } ) {

    if (process.browser) {

        const pdfMake = require('pdfmake/build/pdfmake.js')
        const pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs

        pdfMake.tableLayouts = mfTableLayouts

        const doc = {
            info: {
                title,
            },

            ...pageConfig,

            styles: {
                ...mfStyles,

                headerDate: {
                    fontSize   : 9,
                    bold       : true,
                    italics    : false,
                    alignment  : 'center',
                    lineHeight : 1,
                    color,
                },

                headerDateInfo: {
                    fontSize   : 9,
                    bold       : false,
                    italics    : false,
                    alignment  : 'center',
                    lineHeight : 1,
                    color,
                },

                headerFolio: {
                    fontSize   : 9,
                    bold       : true,
                    italics    : false,
                    alignment  : 'center',
                    lineHeight : 1.2,
                    color,
                },

                bodyTableHeader: {
                    fontSize   : 9,
                    bold       : true,
                    italics    : false,
                    alignment  : 'left',
                    lineHeight : 1.4,
                    color,
                },

                bodyTableData: {
                    fontSize   : 9,
                    bold       : false,
                    italics    : false,
                    alignment  : 'left',
                    lineHeight : 1.4,
                    color,
                },
            },

            content: [],
        }

        setMachineryJobRegistryPdfHeader(doc, data)
        setMachineryJobRegistryPdfBody(doc, data)

        const pdfDocGenerator = pdfMake.createPdf(doc)

        if (download)
            pdfDocGenerator.open()

        return pdfDocGenerator

    }

}

function setCompanyHeader(doc) {

    doc.content.push( {
        columns: [
            {
                image : process.env.NUXT_ENV_LOGO_BASE64,
                width : 75,
            },
            {
                width : '*',
                text  : [
                    { text: `${process.env.NUXT_ENV_RAZON_SOCIAL  }\n`, style: 'headerCompanyInfo' },
                    { text: `${process.env.NUXT_ENV_GIRO  }\n`, style: 'headerCompanyInfo' },
                    { text: `${process.env.NUXT_ENV_DIRECCION  }\n`, style: 'headerCompanyInfo' },
                    { text: `RUT: ${process.env.NUXT_ENV_RUT}\n`, style: 'headerCompanyInfo' },
                    { text: `Fono: ${process.env.NUXT_ENV_FONO} - Email: ${process.env.NUXT_ENV_CONTACTO_EMAIL}`, style: 'headerCompanyInfo' },
                ],
            },
        ],

        columnGap: 20,
    } )

    doc.content.push( { text: '\n' } )

}

function setMachineryJobRegistryPdfHeader(doc, data) {

    const day = moment.utc(data.date).format('DD')
    const month = moment.utc(data.date).format('MM')
    const year = moment.utc(data.date).format('YYYY')

    setCompanyHeader(doc)

    doc.content.push( {
        columns: [
            {
                width : '*',
                text  : [],
            },
            {
                width  : 'auto',
                layout : 'mfBorderedLayout',
                table  : {
                    headerRows : 1,
                    widths     : [ 50, 50, 50 ],

                    body: [
                        [{ text: 'DIA', style: 'headerDate' }, { text: 'MES', style: 'headerDate' }, { text: 'AÑO', style: 'headerDate' }],
                        [{ text: day, style: 'headerDateInfo' }, { text: month, style: 'headerDateInfo' }, { text: year, style: 'headerDateInfo' }],
                    ],

                    alignment: 'center',
                },
            },
        ],
    } )

    doc.content.push( { text: '\n', lineHeight: 0.5 } )

    doc.content.push( {
        columns: [
            {
                width : '*',
                text  : [],
            },
            {
                width : 175,
                style : 'headerFolio',
                text  : [ 'Nro Folio: ', data.folio ],
            },
        ],
    } )

    doc.content.push( { text: '\n' } )

}

function setMachineryJobRegistryPdfBody(doc, data) {

    // data parser
    const equipment = data.equipment.__typename === 'ExternalEquipment' ? data.equipment.name : data.equipment.code
    const operator = data.operator.name

    const headersByMachineryType = []
    const bodyByMachineryType = []

    switch (data.machineryType) {

        case MachineryType.TRUCK: {

            const workCondition = !data.workCondition ? data.bookingWorkCondition : data.workCondition

            if (workCondition === TruckWorkConditionsTypes.DAY) {

                const workingDayTypeLabel = WorkingDayTypes.find( (wdt) => wdt.value === data.workingDayType).label

                headersByMachineryType.push( [{ text: 'Tipo de Jornada:', style: 'bodyTableHeader' }] )
                bodyByMachineryType.push( [{ text: workingDayTypeLabel, style: 'bodyTableData' }] )

            }

            if (workCondition === TruckWorkConditionsTypes.TRAVEL) {

                const volume = data.equipment.volume || 0

                headersByMachineryType.push( [{ text: 'Nro. de Viajes:', style: 'bodyTableHeader' }] )
                headersByMachineryType.push( [{ text: 'Volumen:', style: 'bodyTableHeader' }] )
                headersByMachineryType.push( [{ text: 'Carga:', style: 'bodyTableHeader' }] )

                bodyByMachineryType.push( [{ text: data.totalTravels, style: 'bodyTableData' }] )
                bodyByMachineryType.push( [{ text: volume, style: 'bodyTableData' }] )
                bodyByMachineryType.push( [{ text: data.load, style: 'bodyTableData' }] )

            }

            break

        }

        case MachineryType.OTHER: {

            headersByMachineryType.push( [{ text: 'Horómetro Inicial:', style: 'bodyTableHeader' }] )
            headersByMachineryType.push( [{ text: 'Horómetro Final:', style: 'bodyTableHeader' }] )
            headersByMachineryType.push( [{ text: 'Total Horas:', style: 'bodyTableHeader' }] )

            bodyByMachineryType.push( [{ text: data.startHourmeter, style: 'bodyTableData' }] )
            bodyByMachineryType.push( [{ text: data.endHourmeter, style: 'bodyTableData' }] )
            bodyByMachineryType.push( [{ text: data.totalHours, style: 'bodyTableData' }] )

            break

        }

    }

    // doc body

    doc.content.push( {
        width : '*',
        text  : [
            { text: 'REPORTE DIARIO\n\n', style: 'bodyTitle' },
        ],
    } )

    doc.content.push( {
        columns: [
            {
                width  : 'auto',
                layout : 'mfBodyHeaderLayout',
                table  : {
                    headerRows : 0,
                    widths     : [ 'auto' ],

                    body: [
                        [{ text: 'Cliente:', style: 'bodyTableHeader' }],
                        [{ text: 'Equipo:', style: 'bodyTableHeader' }],
                        [{ text: 'Operador:', style: 'bodyTableHeader' }],
                        [{ text: 'Obra:', style: 'bodyTableHeader' }],
                        [{ text: 'Ubicación:', style: 'bodyTableHeader' }],
                        ...headersByMachineryType,
                    ],
                },
            },
            {
                width  : '*',
                layout : 'mfBodyLayout',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ text: data.client.name, style: 'bodyTableData' }],
                        [{ text: equipment, style: 'bodyTableData' }],
                        [{ text: operator, style: 'bodyTableData' }],
                        [{ text: `${data.building}`, style: 'bodyTableData' }],
                        [{ text: `${data.address}`, style: 'bodyTableData' }],
                        ...bodyByMachineryType,
                    ],
                },
            },
        ],

        columnGap: 10,
    } )

    doc.content.push( { text: '\n' } )

    doc.content.push( {
        width  : '*',
        layout : 'mfBorderedLayout',
        table  : {
            headerRows : 1,
            widths     : [ '*' ],

            body: [
                [{ text: 'Observaciones', style: 'headerObservationTable' }],
                [{ text: data.observations, style: 'dataObservationTable' }],
            ],
        },
    } )

    doc.content.push( { text: '\n\n\n' } )


    // signature

    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

    const firstSignature = data.executor.signature
    const firstSignatureLabel = data.operator.__typename === 'ExternalOperator' ? 'FIRMA JEFE DE OBRA' : 'FIRMA OPERADOR'

    const secondSignature = data.signature ? data.signature : blankImage
    const secondSignatureLabel = data.operator.__typename === 'ExternalOperator' ? 'FIRMA OPERADOR' : 'FIRMA JEFE DE OBRA'

    doc.content.push( {
        columns: [
            {
                width  : '*',
                layout : 'noBorders',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ image: firstSignature, width: 170, height: 80 }],
                        [{ text: firstSignatureLabel, style: 'headerSignature' }],
                    ],
                },

                alignment: 'center',
            },
            {
                width  : '*',
                layout : 'noBorders',
                table  : {
                    headerRows : 0,
                    widths     : [ '*' ],

                    body: [
                        [{ image: secondSignature, width: 170, height: 80 }],
                        [{ text: secondSignatureLabel, style: 'headerSignature' }],
                    ],
                },

                alignment: 'center',
            },
        ],
    } )

}

export function generateDailyPayStatePdf( { title, data, date, total } ) {

    if (process.browser) {

        const pdfMake = require('pdfmake/build/pdfmake.js')
        const pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs

        pdfMake.tableLayouts = mfTableLayouts

        const doc = {
            info: {
                title,
            },

            ...pageConfig,
            pageMargins     : [ 30, 40, 30, 40 ],
            pageOrientation : 'landscape',

            styles: {
                ...mfStyles,
                sign: {
                    fontSize   : 9,
                    bold       : false,
                    italics    : false,
                    alignment  : 'center',
                    lineHeight : 1,
                    color,
                },
            },

            content: [],
        }


        setCompanyHeader(doc)

        doc.content.push( {
            width : '*',
            text  : [
                { text: `Fecha: ${date}\n\n`, style: 'bodyTitle' },
            ],
        } )

        const parsedeData = data.map( (item) => {

            return [
                { text: item.client, style: 'tableData' },
                { text: item.building, style: 'tableData' },
                { text: item.operator, style: 'tableData' },
                { text: item.equipment, style: 'tableData' },
                { text: item.amountPerUse, style: 'tableData' },
                { text: item.amounType, style: 'tableData' },
                { text: item.load, style: 'tableData' },
                { text: item.volume, style: 'tableData' },
                { text: item.hours, style: 'tableData' },
                { text: item.minHours, style: 'tableData' },
                { text: item.totalTravels, style: 'tableData' },
                { text: item.toFacture, style: 'tableData' },
                { text: item.totalAmount, style: 'tableData' },
            ]

        } )

        doc.content.push( {
            width  : '*',
            layout : 'mfFullBorderedLayout',
            table  : {
                headerRows : 1,
                widths     : [ '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                body: [
                    [
                        { text: 'Cliente', style: 'tableHeader' },
                        { text: 'Obra', style: 'tableHeader' },
                        { text: 'Operador', style: 'tableHeader' },
                        { text: 'Equipo', style: 'tableHeader' },
                        { text: 'Monto hr/viaje/jornada', style: 'tableHeader' },
                        { text: 'Tipo de Cobro', style: 'tableHeader' },
                        { text: 'Carga', style: 'tableHeader' },
                        { text: 'Volumen', style: 'tableHeader' },
                        { text: 'Horómetro', style: 'tableHeader' },
                        { text: 'Mínimas', style: 'tableHeader' },
                        { text: 'N° Viajes', style: 'tableHeader' },
                        { text: 'A Facturar', style: 'tableHeader' },
                        { text: 'Cobro', style: 'tableHeader' },
                    ],
                    ...parsedeData,
                    [
                        { text: 'Total diario', style: 'tableHeader', alignment: 'right', colSpan: 12 },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: '' },
                        { text: total, style: 'tableData' },
                    ],
                ],
            },
        } )

        doc.content.push( { text: '\n\n' } )

        doc.content.push( {
            columns: [
                {
                    width : '*',
                    text  : '',
                },
                {
                    image : process.env.NUXT_ENV_CEO_SIGNATURE,
                    width : 125,
                },
                {
                    width : '*',
                    text  : '',
                },
            ],
        } )

        doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
        doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
        doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

        pdfMake.createPdf(doc).open()

    }

}

export function generateGeneralPayStatePdf( { title, data, client } ) {

    if (process.browser) {

        const numeral = require('numeral')
        require('numeral/locales/es')

        numeral.locale('es')

        const pdfMake = require('pdfmake/build/pdfmake.js')
        const pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs

        pdfMake.tableLayouts = mfTableLayouts

        const doc = {
            info: {
                title,
            },

            ...pageConfig,
            pageMargins     : [ 30, 40, 30, 40 ],
            pageOrientation : 'landscape',

            styles: {
                ...mfStyles,
                sign: {
                    fontSize   : 9,
                    bold       : false,
                    italics    : false,
                    alignment  : 'center',
                    lineHeight : 1,
                    color,
                },
            },

            content: [],
        }

        const internTrucksByDay = data.intern.TRUCK.filter( (item) => item.workCondition === 'DAY')
        const internTrucksByTravel = data.intern.TRUCK.filter( (item) => item.workCondition === 'TRAVEL')

        const externTrucksByDay = data.extern.TRUCK.filter( (item) => item.workCondition === 'DAY')
        const externTrucksByTravel = data.extern.TRUCK.filter( (item) => item.workCondition === 'TRAVEL')

        // INTERN OTHER
        if (data.intern.OTHER.length > 0) {

            setCompanyHeader(doc)

            doc.content.push( {
                width : '*',
                text  : [
                    { text: 'INTERNOS\n', style: 'bodyTitle' },
                    { text: `Cliente: ${client}\n\n`, style: 'bodyTitle' },
                ],
            } )

            const parsedData = data.intern.OTHER.map( (item) => {

                return [
                    { text: item.date, style: 'tableData' },
                    { text: item.building, style: 'tableData' },
                    { text: item.folio, style: 'tableData' },
                    { text: item.equipment, style: 'tableData' },
                    { text: item.operator, style: 'tableData' },
                    { text: item.hours, style: 'tableData' },
                    { text: item.minHours, style: 'tableData' },
                    { text: item.toFacture, style: 'tableData' },
                    { text: item.amountPerUse, style: 'tableData' },
                    { text: item.totalAmount, style: 'tableData' },
                ]

            } )

            doc.content.push( {
                width  : '*',
                layout : 'mfFullBorderedLayout',
                table  : {
                    headerRows : 1,
                    widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                    body: [
                        [
                            { text: 'Fecha', style: 'tableHeader' },
                            { text: 'Obra', style: 'tableHeader' },
                            { text: 'Nro. Reporte', style: 'tableHeader' },
                            { text: 'Equipo', style: 'tableHeader' },
                            { text: 'Operador', style: 'tableHeader' },
                            { text: 'Horómetro', style: 'tableHeader' },
                            { text: 'Mínimas', style: 'tableHeader' },
                            { text: 'A Facturar', style: 'tableHeader' },
                            { text: 'Tarifa (incluye petroleo)', style: 'tableHeader' },
                            { text: 'Cobro', style: 'tableHeader' },
                        ],
                        ...parsedData,
                        [
                            { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.intern.totalOther, style: 'tableData' },
                        ],
                        [
                            { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.intern.totalOtherIva, style: 'tableData' },
                        ],
                        [
                            { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.intern.totalIvaIncludedOther, style: 'tableData' },
                        ],
                    ],
                },

                alignment: 'center',
            } )

            doc.content.push( { text: '\n\n' } )

            doc.content.push( {
                columns: [
                    {
                        width : '*',
                        text  : '',
                    },
                    {
                        image : process.env.NUXT_ENV_CEO_SIGNATURE,
                        width : 125,
                    },
                    {
                        width : '*',
                        text  : '',
                    },
                ],
            } )

            doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
            doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
            doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

            if ( (data.intern.TRUCK.length > 0 && (internTrucksByDay.length > 0 || internTrucksByTravel.length > 0) )
                || data.extern.OTHER.length > 0
                || (data.extern.TRUCK.length > 0 && (externTrucksByDay.length > 0 || externTrucksByTravel.length > 0) ) )
                doc.content.push( { text: '', pageBreak: 'after' } )

        }


        // INTERN TRUCK - DAY

        if (data.intern.TRUCK.length > 0) {

            if (internTrucksByDay.length > 0) {

                setCompanyHeader(doc)

                doc.content.push( {
                    width : '*',
                    text  : [
                        { text: 'INTERNOS\n', style: 'bodyTitle' },
                        { text: `Cliente: ${client}\n`, style: 'bodyTitle' },
                        { text: 'Camión por Jornada\n\n', style: 'bodyTitle' },
                    ],
                } )

                let totalTruck = 0

                const parsedData = internTrucksByDay.map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        { text: item.date, style: 'tableData' },
                        { text: item.building, style: 'tableData' },
                        { text: item.folio, style: 'tableData' },
                        { text: item.equipment, style: 'tableData' },
                        { text: item.operator, style: 'tableData' },
                        { text: item.workingDayType, style: 'tableData' },
                        { text: item.amountPerUse, style: 'tableData' },
                        { text: item.volume, style: 'tableData' },
                        { text: numeral(item.totalAmount).format('$0,0'), style: 'tableData' },
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                doc.content.push( {
                    width  : '*',
                    layout : 'mfFullBorderedLayout',
                    table  : {
                        headerRows : 1,
                        widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                        body: [
                            [
                                { text: 'Fecha', style: 'tableHeader' },
                                { text: 'Obra', style: 'tableHeader' },
                                { text: 'Nro. Reporte', style: 'tableHeader' },
                                { text: 'Equipo', style: 'tableHeader' },
                                { text: 'Operador', style: 'tableHeader' },
                                { text: 'Tipo Jornada', style: 'tableHeader' },
                                { text: 'Monto', style: 'tableHeader' },
                                { text: 'Volumen', style: 'tableHeader' },
                                { text: 'A Facturar', style: 'tableHeader' },
                            ],
                            ...parsedData,
                            [
                                { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 8 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruck, style: 'tableData' },
                            ],
                            [
                                { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 8 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruckIva, style: 'tableData' },
                            ],
                            [
                                { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 8 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalIvaIncludedTruck, style: 'tableData' },
                            ],
                        ],
                    },

                    alignment: 'center',
                } )

                doc.content.push( { text: '\n\n' } )

                doc.content.push( {
                    columns: [
                        {
                            width : '*',
                            text  : '',
                        },
                        {
                            image : process.env.NUXT_ENV_CEO_SIGNATURE,
                            width : 125,
                        },
                        {
                            width : '*',
                            text  : '',
                        },
                    ],
                } )

                doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

                if ( (data.intern.TRUCK.length > 0 && internTrucksByTravel.length > 0)
                    || data.extern.OTHER.length > 0
                    || (data.extern.TRUCK.length > 0 && (externTrucksByDay.length > 0 || externTrucksByTravel.length > 0) ) )
                    doc.content.push( { text: '', pageBreak: 'after' } )

            }

        }


        // INTERN TRUCK - TRAVEL
        if (data.intern.TRUCK.length > 0) {

            if (internTrucksByTravel.length > 0) {

                setCompanyHeader(doc)

                doc.content.push( {
                    width : '*',
                    text  : [
                        { text: 'INTERNOS\n', style: 'bodyTitle' },
                        { text: `Cliente: ${client}\n`, style: 'bodyTitle' },
                        { text: 'Camión por Viaje\n\n', style: 'bodyTitle' },
                    ],
                } )

                let totalTruck = 0

                const parsedData = internTrucksByTravel.map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        { text: item.date, style: 'tableData' },
                        { text: item.building, style: 'tableData' },
                        { text: item.folio, style: 'tableData' },
                        { text: item.equipment, style: 'tableData' },
                        { text: item.operator, style: 'tableData' },
                        { text: item.totalTravels, style: 'tableData' },
                        { text: item.load, style: 'tableData' },
                        { text: item.amountPerUse, style: 'tableData' },
                        { text: item.volume, style: 'tableData' },
                        { text: numeral(item.totalAmount).format('$0,0'), style: 'tableData' },
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                doc.content.push( {
                    width  : '*',
                    layout : 'mfFullBorderedLayout',
                    table  : {
                        headerRows : 1,
                        widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                        body: [
                            [
                                { text: 'Fecha', style: 'tableHeader' },
                                { text: 'Obra', style: 'tableHeader' },
                                { text: 'Nro. Reporte', style: 'tableHeader' },
                                { text: 'Equipo', style: 'tableHeader' },
                                { text: 'Operador', style: 'tableHeader' },
                                { text: 'Nro. Viajes', style: 'tableHeader' },
                                { text: 'Tipo Carga', style: 'tableHeader' },
                                { text: 'Monto', style: 'tableHeader' },
                                { text: 'Volumen', style: 'tableHeader' },
                                { text: 'A Facturar', style: 'tableHeader' },
                            ],
                            ...parsedData,
                            [
                                { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruck, style: 'tableData' },
                            ],
                            [
                                { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruckIva, style: 'tableData' },
                            ],
                            [
                                { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalIvaIncludedTruck, style: 'tableData' },
                            ],
                        ],
                    },

                    alignment: 'center',
                } )

                doc.content.push( { text: '\n\n' } )

                doc.content.push( {
                    columns: [
                        {
                            width : '*',
                            text  : '',
                        },
                        {
                            image : process.env.NUXT_ENV_CEO_SIGNATURE,
                            width : 125,
                        },
                        {
                            width : '*',
                            text  : '',
                        },
                    ],
                } )

                doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

                if (data.extern.OTHER.length > 0
                    || (data.extern.TRUCK.length > 0 && (externTrucksByDay.length > 0 || externTrucksByTravel.length > 0) ) )
                    doc.content.push( { text: '', pageBreak: 'after' } )

            }

        }


        // EXTERN OTHER
        if (data.extern.OTHER.length > 0) {

            setCompanyHeader(doc)

            doc.content.push( {
                width : '*',
                text  : [
                    { text: 'EXTERNOS\n', style: 'bodyTitle' },
                    { text: `Cliente: ${client}\n\n`, style: 'bodyTitle' },
                ],
            } )

            const parsedData = data.extern.OTHER.map( (item) => {

                return [
                    { text: item.date, style: 'tableData' },
                    { text: item.building, style: 'tableData' },
                    { text: item.folio, style: 'tableData' },
                    { text: item.equipment, style: 'tableData' },
                    { text: item.operator, style: 'tableData' },
                    { text: item.hours, style: 'tableData' },
                    { text: item.minHours, style: 'tableData' },
                    { text: item.toFacture, style: 'tableData' },
                    { text: item.amountPerUse, style: 'tableData' },
                    { text: item.totalAmount, style: 'tableData' },
                ]

            } )

            doc.content.push( {
                width  : '*',
                layout : 'mfFullBorderedLayout',
                table  : {
                    headerRows : 1,
                    widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                    body: [
                        [
                            { text: 'Fecha', style: 'tableHeader' },
                            { text: 'Obra', style: 'tableHeader' },
                            { text: 'Nro. Reporte', style: 'tableHeader' },
                            { text: 'Equipo', style: 'tableHeader' },
                            { text: 'Operador', style: 'tableHeader' },
                            { text: 'Horómetro', style: 'tableHeader' },
                            { text: 'Mínimas', style: 'tableHeader' },
                            { text: 'A Facturar', style: 'tableHeader' },
                            { text: 'Tarifa (incluye petroleo)', style: 'tableHeader' },
                            { text: 'Cobro', style: 'tableHeader' },
                        ],
                        ...parsedData,
                        [
                            { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.extern.totalOther, style: 'tableData' },
                        ],
                        [
                            { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.extern.totalOtherIva, style: 'tableData' },
                        ],
                        [
                            { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: '' },
                            { text: data.extern.totalIvaIncludedOther, style: 'tableData' },
                        ],
                    ],
                },

                alignment: 'center',
            } )

            doc.content.push( { text: '\n\n' } )

            doc.content.push( {
                columns: [
                    {
                        width : '*',
                        text  : '',
                    },
                    {
                        image : process.env.NUXT_ENV_CEO_SIGNATURE,
                        width : 125,
                    },
                    {
                        width : '*',
                        text  : '',
                    },
                ],
            } )

            doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
            doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
            doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

            if (data.extern.TRUCK.length > 0 && (externTrucksByDay.length > 0 || externTrucksByTravel.length > 0) )
                doc.content.push( { text: '', pageBreak: 'after' } )

        }


        // EXTERN TRUCK - DAY
        if (data.extern.TRUCK.length > 0) {

            if (externTrucksByDay.length > 0) {

                setCompanyHeader(doc)

                doc.content.push( {
                    width : '*',
                    text  : [
                        { text: 'EXTERNOS\n', style: 'bodyTitle' },
                        { text: `Cliente: ${client}\n`, style: 'bodyTitle' },
                        { text: 'Camión por Jornada\n\n', style: 'bodyTitle' },
                    ],
                } )

                let totalTruck = 0

                const parsedData = externTrucksByDay.map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        { text: item.date, style: 'tableData' },
                        { text: item.building, style: 'tableData' },
                        { text: item.folio, style: 'tableData' },
                        { text: item.equipment, style: 'tableData' },
                        { text: item.operator, style: 'tableData' },
                        { text: item.workingDayType, style: 'tableData' },
                        { text: item.amountPerUse, style: 'tableData' },
                        { text: item.volume, style: 'tableData' },
                        { text: numeral(item.totalAmount).format('$0,0'), style: 'tableData' },
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                doc.content.push( {
                    width  : '*',
                    layout : 'mfFullBorderedLayout',
                    table  : {
                        headerRows : 1,
                        widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                        body: [
                            [
                                { text: 'Fecha', style: 'tableHeader' },
                                { text: 'Obra', style: 'tableHeader' },
                                { text: 'Nro. Reporte', style: 'tableHeader' },
                                { text: 'Equipo', style: 'tableHeader' },
                                { text: 'Operador', style: 'tableHeader' },
                                { text: 'Tipo Jornada', style: 'tableHeader' },
                                { text: 'Monto', style: 'tableHeader' },
                                { text: 'Volumen', style: 'tableHeader' },
                                { text: 'A Facturar', style: 'tableHeader' },
                            ],
                            ...parsedData,
                            [
                                { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruck, style: 'tableData' },
                            ],
                            [
                                { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruckIva, style: 'tableData' },
                            ],
                            [
                                { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalIvaIncludedTruck, style: 'tableData' },
                            ],
                        ],
                    },

                    alignment: 'center',
                } )

                doc.content.push( { text: '\n\n' } )

                doc.content.push( {
                    columns: [
                        {
                            width : '*',
                            text  : '',
                        },
                        {
                            image : process.env.NUXT_ENV_CEO_SIGNATURE,
                            width : 125,
                        },
                        {
                            width : '*',
                            text  : '',
                        },
                    ],
                } )

                doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

                if (data.extern.TRUCK.length > 0 && externTrucksByTravel.length > 0)
                    doc.content.push( { text: '', pageBreak: 'after' } )

            }

        }


        // EXTERN TRUCK - TRAVEL
        if (data.extern.TRUCK.length > 0) {

            if (externTrucksByTravel.length > 0) {

                setCompanyHeader(doc)

                doc.content.push( {
                    width : '*',
                    text  : [
                        { text: 'EXTERNOS\n', style: 'bodyTitle' },
                        { text: `Cliente: ${client}\n`, style: 'bodyTitle' },
                        { text: 'Camión por Viaje\n\n', style: 'bodyTitle' },
                    ],
                } )

                let totalTruck = 0

                const parsedData = externTrucksByTravel.map( (item) => {

                    totalTruck += item.totalAmount

                    return [
                        { text: item.date, style: 'tableData' },
                        { text: item.building, style: 'tableData' },
                        { text: item.folio, style: 'tableData' },
                        { text: item.equipment, style: 'tableData' },
                        { text: item.operator, style: 'tableData' },
                        { text: item.totalTravels, style: 'tableData' },
                        { text: item.load, style: 'tableData' },
                        { text: item.amountPerUse, style: 'tableData' },
                        { text: item.volume, style: 'tableData' },
                        { text: numeral(item.totalAmount).format('$0,0'), style: 'tableData' },
                    ]

                } )

                const totalIvaIncludedTruck = numeral(totalTruck * 1.19).format('$0,0')
                const totalTruckIva = numeral(totalTruck * 0.19).format('$0,0')
                totalTruck = numeral(totalTruck).format('$0,0')

                doc.content.push( {
                    width  : '*',
                    layout : 'mfFullBorderedLayout',
                    table  : {
                        headerRows : 1,
                        widths     : [ 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],

                        body: [
                            [
                                { text: 'Fecha', style: 'tableHeader' },
                                { text: 'Obra', style: 'tableHeader' },
                                { text: 'Nro. Reporte', style: 'tableHeader' },
                                { text: 'Equipo', style: 'tableHeader' },
                                { text: 'Operador', style: 'tableHeader' },
                                { text: 'Nro. Viajes', style: 'tableHeader' },
                                { text: 'Tipo Carga', style: 'tableHeader' },
                                { text: 'Monto', style: 'tableHeader' },
                                { text: 'Volumen', style: 'tableHeader' },
                                { text: 'A Facturar', style: 'tableHeader' },
                            ],
                            ...parsedData,
                            [
                                { text: 'Neto', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruck, style: 'tableData' },
                            ],
                            [
                                { text: 'IVA', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalTruckIva, style: 'tableData' },
                            ],
                            [
                                { text: 'Total', style: 'tableHeader', alignment: 'right', colSpan: 9 },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: '' },
                                { text: totalIvaIncludedTruck, style: 'tableData' },
                            ],
                        ],
                    },

                    alignment: 'center',
                } )

                doc.content.push( { text: '\n\n' } )

                doc.content.push( {
                    columns: [
                        {
                            width : '*',
                            text  : '',
                        },
                        {
                            image : process.env.NUXT_ENV_CEO_SIGNATURE,
                            width : 125,
                        },
                        {
                            width : '*',
                            text  : '',
                        },
                    ],
                } )

                doc.content.push( { text: process.env.NUXT_ENV_CEO_NAME, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_CEO_PROFESION, width: '*', style: 'sign' } )
                doc.content.push( { text: process.env.NUXT_ENV_RAZON_SOCIAL, width: '*', style: 'sign' } )

            }

        }


        pdfMake.createPdf(doc).open()

    }

}
