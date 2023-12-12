const { jwtUncrypt } = require('./midleware/authentication'),
    { PrismaClient } = require("@prisma/client"),
    p = new PrismaClient(),
    { verify, sign } = require("jsonwebtoken"),
    { compareSync, hashSync } = require('bcryptjs'),
    error = {
        status: 500,
        message: "Erro Interno"
    },
    moment = require('moment'),

    // **************************************** CREATE EVENT
    newSchedule = async (body, auth) => {

        let x = await jwtUncrypt(auth);

        if (!!x.user.email && !!body.serviceId && !!body.scheduleDateId) {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: x.user.email,
                    deletedAt: null
                }
            })

            const serviceExist = await p.services.findFirst({
                where: {
                    id: body.serviceId,
                    deletedAt: null
                }
            })

            const scheduleExist = await p.schedule_list.findFirst({
                where: {
                    id: body.scheduleDateId,
                    situation: false,
                    deletedAt: null
                }
            })

            if (!alreadyUser || !scheduleExist || !serviceExist) {
                return {
                    status: 409,
                    message: "Critérios para reservar o Horário não atendidos."
                }
            }

            try {

                const desc = await p.schedule_events.create({
                    data: {
                        user: { connect: { id: x.user.id } },
                        services: { connect: { id: body.serviceId } },
                        schedule_list: { connect: { id: body.scheduleDateId } },
                        createdAt: new Date(),
                        updatedAt: null,
                        deletedAt: null
                    }
                });

                const reserv = await p.schedule_list.update({
                    where: {
                        id: body.scheduleDateId
                    }, data: {
                        situation: true,
                        updatedAt: new Date()
                    }
                })


                await p.$disconnect();

                return { status: 200, newEvent: { user: x.user.name, service: serviceExist.name, date: reserv.schedule_date } }

            } catch (error) {
                console.log(error, "Erro ao cadastrar Horário");
                return error;
            }
        } else {
            return { status: 401, message: "Critérios para reservar o Horário não atendidos." }
        }
    },

    // **************************************** DELETE EVENT
    deleteSchedule = async (body, auth) => {

        let x = await jwtUncrypt(auth);
        let y = await getEventById(body.id, auth)

        console.log(y.res.scheduleDate_id)
        if (!!x.user.email && !!y.res.scheduleDate_id && !!y.res.service_id) {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: x.user.email,
                    deletedAt: null
                }
            })

            const scheduleExist = await p.schedule_list.findFirst({
                where: {
                    id: y.res.scheduleDate_id,
                    situation: true,
                    deletedAt: null
                }
            })

            const scheduleEventExist = await p.services.findFirst({
                where: {
                    id: y.res.service_id,
                    deletedAt: null
                }
            })

            if (!alreadyUser || !scheduleExist || !scheduleEventExist) {
                return {
                    status: 409,
                    message: "Critérios para reservar o Horário não atendidos."
                }
            }

            try {

                const desc = await p.schedule_events.update({
                    where: {
                        id: y.res.id
                    }, data: {
                        deletedAt: new Date()
                    }
                })

                const reserv = await p.schedule_list.update({
                    where: {
                        id: y.res.scheduleDate_id
                    }, data: {
                        situation: false,
                        updatedAt: new Date()
                    }
                })


                await p.$disconnect();

                return desc

            } catch (error) {
                console.log(error, "Erro ao cadastrar Horário");
                return error;
            }
        } else {
            return { status: 401, message: "Critérios para reservar o Horário não atendidos." }
        }
    },


    // **************************************** LIST CREATE SERVICE
    newList = async (body) => {
        try {
            const formattedDate = moment(body.scheduleDate, 'DD/MM/YYYY HH:mm').toDate();

            const desc = await p.schedule_list.create({
                data: {
                    schedule_date: formattedDate,
                    situation: false,
                    createdAt: new Date(),
                    updatedAt: null,
                    deletedAt: null
                }
            });

            return { status: 200, scheduleList: desc };
        } catch (error) {
            console.log(error, "Erro ao cadastrar lista de agendamento");
            return { status: 500, message: 'Erro interno ao cadastrar a lista de agendamento' };
        }
    },

    // **************************************** LIST DELETE SERVICE
    deleteList = async (body) => {
        try {
            const desc = await p.schedule_list.update({
                where: {
                    id: body.id
                },
                data: {
                    deletedAt: new Date()
                }
            })

            await p.$disconnect();
            return { status: 200, message: "Service deletado com Sucesso!", res: desc }

        } catch (error) {
            console.log(error, "Erro ao deletar Service");
            return error;
        }
    },

    // **************************************** EVENT GET
    getEvent = async (auth) => {

        let x = await jwtUncrypt(auth);

        if (!!x.user.email) {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: x.user.email,
                    deletedAt: null
                }
            })

            if (!alreadyUser) {
                return {
                    status: 400,
                    message: "Usuário não existe"
                }
            }

            try {
                const desc = await p.schedule_events.findMany({
                    where: {
                        user_id: x.user.id,
                        deletedAt: null
                    },
                    include: {
                        user: true,
                        services: true,
                        schedule_list: true
                    }
                })

                await p.$disconnect();
                return { status: 200, res: desc }

            } catch (error) {
                console.log(error, "Erro ao gerar Eventos");
                return error;
            }
        } else {
            return {
                status: 409,
                message: "Usuário sem Autorização"
            }
        }
    },
    // **************************************** EVENT GET BY ID
    getEventById = async (body, auth) => {

        let x = await jwtUncrypt(auth);

        if (!!x.user.email) {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: x.user.email,
                    deletedAt: null
                }
            })

            if (!alreadyUser) {
                return {
                    status: 400,
                    message: "Usuário não existe"
                }
            }

            try {
                const desc = await p.schedule_events.findFirst({
                    where: {
                        user_id: x.user.id,
                        id: body.id,
                        deletedAt: null
                    },
                    include: {
                        user: true,
                        services: true,
                        schedule_list: true
                    }
                })

                await p.$disconnect();
                return { status: 200, res: desc }

            } catch (error) {
                console.log(error, "Erro ao gerar Eventos");
                return error;
            }
        } else {
            return {
                status: 409,
                message: "Usuário sem Autorização"
            }
        }
    },
    // **************************************** LIST GET
    getList = async () => {

        try {
            const desc = await p.schedule_list.findMany({
                where: {
                    situation: false
                },
                orderBy: {
                    schedule_date: 'asc'
                }
            });
            await p.$disconnect();
            return desc;

        } catch (error) {
            console.log(error, "Erro ao gerar Lista");
            return error;
        }
    }

module.exports = { newSchedule, deleteSchedule, newList, deleteList, getEvent, getList, getEventById };