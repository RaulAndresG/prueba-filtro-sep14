
//Express
const express = require('express');
//Mongodb 
const { MongoClient, ObjectId } = require('mongodb');
///
const moment = require('moment');
require('dotenv').config();
///
const router = express.Router();

const bases = process.env.DATA;
const nombrebase = 'EPS';

router.get('/enpo1', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('usuario');
        const result = await collection.find().sort({ usu_nombre: 1 }).toArray();
        res.json({
            msg: "Obtener pacientes de manera alfabética (por primer nombre).",
            result
        });
        client.close();
    } catch (error) {
        console.log(error, "Error endpo1.");
    }
});

router.get('/enpo2', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const query = { cit_fecha: "14-09-2023" };
        const result = await collection
            .aggregate([
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'usuario',
                        localField: 'cit_datosUsuario',
                        foreignField: '_id',
                        as: 'usuario'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        cit_fecha: 1,
                        'usuario.usu_nombre': 1,
                        'usuario.usu_segdo_nombre': 1,
                        'usuario.usu_primer_apellido': 1,
                        'usuario.usu_segdo_apellido': 1
                    }
                }
            ])
            .sort({ 'usuario.usu_nombre': 1 })
            .toArray();

        res.json({
            msg: "Obtener citas por fecha (fecha: 14-09-2023)(Se puede agregar alguna otra fecha) ordenando  de manera alfabética (primer nombre).",
            result
        });
    } catch (error) {
        console.log(error, "Error enpo2.");
    }
});

router.get('/enpo3', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('medico');
        const query = { med_especialidad: new ObjectId('6502f7c9928eaf03e12bd965') };

        const result = await collection.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'consultorio',
                    let: { consultorioId: '$med_consultorio' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$consultorioId'] }
                            }
                        }
                    ],
                    as: 'consultorio'
                }
            },
            {
                $lookup: {
                    from: 'especialidad',
                    let: { especialidadId: '$med_especialidad' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$especialidadId'] }
                            }
                        }
                    ],
                    as: 'especialidad'
                }
            },
            {
                $unwind: '$consultorio'
            },
            {
                $unwind: '$especialidad'
            },
            {
                $project: {
                    _id: 1,
                    med_nroMatriculaProfesional: 1,
                    med_nombreCompleto: 1,
                    med_consultorio: '$consultorio',
                    med_especialidad: '$especialidad'
                }
            }
        ]).toArray();

        res.json({
            msg: "Obtener médico por especialidad (Cardiología clínica)(Se puede agregar alguna otra) con datos completos de consultorio y especialidad.",
            result
        });
        client.close();
    } catch (error) {
        console.error(error, "Error enpo3.");
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.get('/enpo4', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const currentDate = moment().format('DD-MM-YYYY');
        const query = {
            cit_datosUsuario: new ObjectId('650302f6928eaf03e12bd99a'),
            cit_fecha: { $gt: currentDate }
        };

        const result = await collection
            .aggregate([
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'usuario',
                        localField: 'cit_datosUsuario',
                        foreignField: '_id',
                        as: 'usuario'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        cit_fecha: 1,
                        'usuario.usu_nombre': 1,
                        'usuario.usu_segdo_nombre': 1,
                        'usuario.usu_primer_apellido': 1,
                        'usuario.usu_segdo_apellido': 1
                    }
                }
            ])
            .sort({ cit_fecha: 1 })
            .limit(1)
            .toArray();

        if (result.length > 0) {
            res.json({
                msg: "Próxima cita para el paciente:",
                cita: result[0]
            });
        } else {
            res.json({
                msg: "El paciente no tiene citas próximas.",
                cita: null
            });
        }
        client.close();
    } catch (error) {
        console.error(error, "Error enpo4.");
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

router.get('/enpo5', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const query = { 'cit_medico': new ObjectId('6502fcc9928eaf03e12bd986') };
        const result = await collection.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'estado_cita',
                    localField: 'cit_estadoCita',
                    foreignField: '_id',
                    as: 'estadoCita'
                }
            },
            {
                $lookup: {
                    from: 'medico',
                    localField: 'cit_medico',
                    foreignField: '_id',
                    as: 'medico'
                }
            },
            {
                $lookup: {
                    from: 'usuario',
                    localField: 'cit_datosUsuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $project: {
                    _id: 1,
                    cit_fecha: 1,
                    cit_estadoCita: { $arrayElemAt: ['$estadoCita.estcita_nombre', 0] },
                    cit_medico: { $arrayElemAt: ['$medico.med_nombreCompleto', 0] },
                    cit_datosUsuario: {
                        $concat: [
                            { $arrayElemAt: ['$usuario.usu_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_primer_apellido', 0] },
                            ' ',
                        ]
                    }
                }
            }
        ]).toArray();
        res.json({
            msg: "Pacientes los cuales  tienen cita con un médico en específico.",
            result
        });
        client.close();
    } catch (error) {
        console.log(error, "Error enpo5.");
    }
});

router.get('/enpo6', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const query = { cit_fecha: "14-09-2023" };

        const result = await collection.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'estado_cita',
                    localField: 'cit_estadoCita',
                    foreignField: '_id',
                    as: 'estadoCita'
                }
            },
            {
                $lookup: {
                    from: 'medico',
                    localField: 'cit_medico',
                    foreignField: '_id',
                    as: 'medico'
                }
            },
            {
                $lookup: {
                    from: 'usuario',
                    localField: 'cit_datosUsuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $project: {
                    _id: 1,
                    cit_fecha: 1,
                    cit_estadoCita: { $arrayElemAt: ['$estadoCita.estcita_nombre', 0] },
                    cit_medico: { $arrayElemAt: ['$medico.med_nombreCompleto', 0] },
                    cit_datosUsuario: {
                        $concat: [
                            { $arrayElemAt: ['$usuario.usu_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_primer_apellido', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_apellido', 0] }
                        ]
                    }
                }
            }
        ]).toArray();

        res.json({
            msg: "Obtener citas por fecha (fecha: 14-09-2023)(Se puede poner una en espesifico).",
            result
        });
        client.close();
    } catch (error) {
        console.log(error, "Error enpo6.");
    }
});

router.get('/enpo7', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('medico');
        const result = await collection.aggregate([
            {
                $lookup: {
                    from: 'consultorio',
                    let: { consultorioId: '$med_consultorio' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$consultorioId'] }
                            }
                        }
                    ],
                    as: 'consultorio'
                }
            },
            {
                $unwind: '$consultorio'
            },
            {
                $project: {
                    _id: 1,
                    med_nroMatriculaProfesional: 1,
                    med_nombreCompleto: 1,
                    med_consultorio: '$consultorio'

                }
            }]).toArray();
        res.json({
            msg: "Médico con su consultorio correspondientes",
            result
        })
        client.close();
    } catch (error) {
        console.log(error, "Error enpo7.");
    }
});

router.get('/enpo8', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const query = { cit_medico: new ObjectId('6502fcc9928eaf03e12bd987')};
        const citas = await collection.countDocuments(query);
        const result = await collection.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'estado_cita',
                    localField: 'cit_estadoCita',
                    foreignField: '_id',
                    as: 'estadoCita'
                }
            },
            {
                $lookup: {
                    from: 'medico',
                    localField: 'cit_medico',
                    foreignField: '_id',
                    as: 'medico'
                }
            },
            {
                $lookup: {
                    from: 'usuario',
                    localField: 'cit_datosUsuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $project: {
                    _id: 1,
                    cit_fecha: 1,
                    cit_estadoCita: { $arrayElemAt: ['$estadoCita.estcita_nombre', 0] },
                    cit_medico: { $arrayElemAt: ['$medico.med_nombreCompleto', 0] },
                    cit_datosUsuario: {
                        $concat: [
                            { $arrayElemAt: ['$usuario.usu_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_primer_apellido', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_apellido', 0] }
                        ]
                    }
                }
            }
        ]).toArray();
        res.json({
            msg: "Cantidad de citas que tiene un médico en específico (_id: 6502fcc9928eaf03e12bd98f) de medico .",
            citas,
            result
        })
        client.close();
    } catch (error) {
        console.log(error, "Error enpo8.");
    }
});
 
router.get('/enpo9', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');
        const query = { cit_datosUsuario: new ObjectId('650302f6928eaf03e12bd99a')};
        const result = await collection
            .aggregate([
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'medico',
                        localField: 'cit_medico',
                        foreignField: '_id',
                        as: 'medico'
                    }
                },
                {
                    $lookup: {
                        from: 'consultorio',
                        localField: 'medico.med_consultorio',
                        foreignField: '_id',
                        as: 'consultorio'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        'consultorio.cons_nombre': 1
                    }
                },
                {
                    $unwind: '$consultorio'
                }
            ])
            .group({
                _id: null,
                consultorios: { $addToSet: '$consultorio.cons_nombre' }
            })
            .project({
                _id: 0,
                consultorios: 1
            })
            .toArray();

        if (result.length > 0) {
            res.json({
                msg: `Consultorios donde se aplicaron citas para el paciente:`,
                consultorios: result[0].consultorios
            });
        } else {
            res.json({
                msg: `El paciente no tiene citas en consultorios.`,
                consultorios: []
            });
        }
        client.close();
    } catch (error) {
        console.log(error, "Error enpo9.");
    }
}); 

router.get('/enpo10', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const citaCollection = db.collection('cita');
        const usuarioCollection = db.collection('usuario');
        
        const citasPorGeneroAtendidas = await citaCollection.aggregate([
            {
                $match: { cit_estado: "Atendida" } 
            },
            {
                $lookup: {
                    from: 'usuario',
                    localField: 'cit_datosUsuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $unwind: '$usuario' 
            },  
            {
                $project: {
                    _id: 1,
                    cit_fecha: 1,
                    cit_generoPaciente: '$usuario.usu_genero.gen_nombre' 
                }
            }
        ]).toArray();

        res.json({
            msg: "Citas realizadas por pacientes según su género (solo si el estado es 'Atendida')",
            citasPorGeneroAtendidas
        });

        client.close();
    } catch (error) {
        console.log(error, "Error al obtener citas por género atendidas.");
        res.status(500).json({ error: "Error al obtener citas por género atendidas" });
    }
});


router.get('/enpo12', async (req, res) => {
    try {
        const client = new MongoClient(bases);
        await client.connect();
        const db = client.db(nombrebase);
        const collection = db.collection('cita');

        const mesEspecifico = 9; 
        const añoEspecifico = 2023; 

        const fechaInicio = new Date(añoEspecifico, mesEspecifico - 1, 1);
        const fechaFin = new Date(añoEspecifico, mesEspecifico, 0);

        const query = {
            cit_fecha_cancelacion: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        };

        const result = await collection.aggregate([
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'usuario',
                    localField: 'cit_datosUsuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $lookup: {
                    from: 'medico',
                    localField: 'cit_medico',
                    foreignField: '_id',
                    as: 'medico'
                }
            },
            {
                $project: {
                    _id: 1,
                    cit_fecha_cancelacion: 1,
                    cit_datosUsuario: {
                        $concat: [
                            { $arrayElemAt: ['$usuario.usu_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_nombre', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_primer_apellido', 0] },
                            ' ',
                            { $arrayElemAt: ['$usuario.usu_segdo_apellido', 0] }
                        ]
                    },
                    cit_medico: { $arrayElemAt: ['$medico.med_nombreCompleto', 0] }
                }
            }
        ]).toArray();

        res.json({
            msg: `Citas canceladas en el mes ${mesEspecifico} del ${añoEspecifico}`,
            result
        });

        client.close();
    } catch (error) {
        console.log(error, "Error al obtener citas canceladas por mes.");
        res.status(500).json({ error: "Error al obtener citas canceladas por mes" });
    }
});




module.exports = router;