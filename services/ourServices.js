const { jwtUncrypt } = require('./midleware/authentication'),
    { PrismaClient } = require("@prisma/client"),
    p = new PrismaClient(),
    { verify, sign } = require("jsonwebtoken"),
    { compareSync, hashSync } = require('bcryptjs'),
    error = {
        status: 500,
        message: "Erro Interno"
    },

    // **************************************** CREATE SERVICE
    newService = async (body) => {
        try {
            const desc = await p.services.create({
                data: {
                    name: body.name,
                    description: body.description || "",
                    image: body.image || "",
                    value: body.value || 0,
                    createdAt: new Date(),
                    updatedAt: null,
                    deletedAt: null
                }
            });

            return { status: 200, service: desc };
        } catch (error) {
            console.log(error, "Erro ao cadastrar serviço");
            return { status: 500, message: 'Erro interno ao cadastrar o serviço' };
        }
    },

    // **************************************** DELETE SERVICE
    deleteService = async (body) => {
        try {
            const desc = await p.services.update({
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
    }

module.exports = { newService, deleteService };