const { jwtUncrypt } = require('./midleware/authentication'),
    { PrismaClient } = require("@prisma/client"),
    p = new PrismaClient(),
    { verify, sign } = require("jsonwebtoken"),
    { compareSync, hashSync } = require('bcryptjs'),
    error = {
        status: 500,
        message: "Erro Interno"
    },

    // **************************************** LOGIN USER
    signIn = async (body) => {

        try {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: body.email,
                    deletedAt: null
                }
            })

            if (!alreadyUser) {
                await p.$disconnect();
                return {
                    status: 400,
                    message: "Usuário não existe"
                }
            }


            alreadyUser.token = sign({ id: alreadyUser.id, email: alreadyUser.email }, process.env.SECRET_CLIENT_KEY)
            let res = {
                status: 200,
                message: "Usuário Logado Sucesso",
                user: {
                    id: alreadyUser.id,
                    name: alreadyUser.name,
                    email: alreadyUser.email,
                    jwt: alreadyUser.token
                }
            }

            await p.$disconnect();
            return res



        } catch (error) {
            console.log(error, "Erro ao cadastrar user");
            return error;
        }
    },

    // **************************************** CREATE USER
    newUser = async (body) => {

        if (!!body.email && !!body.password) {

            const alreadyUser = await p.user.findFirst({
                where: {
                    email: body.email,
                    deletedAt: null
                }
            })

            if (!!alreadyUser) {
                return {
                    status: 409,
                    message: "E-mail já cadastrado"
                }
            }

            try {

                const desc = await p.user.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        password: hashSync(body.password, 8),
                        createdAt: new Date(),
                        updatedAt: null,
                        deletedAt: null
                    }
                })

                let token = sign({ id: desc.id, email: desc.email }, process.env.SECRET_CLIENT_KEY)

                await p.$disconnect();

                return { status: 200, jwt: token, user: desc }

            } catch (error) {
                console.log(error, "Erro ao cadastrar user");
                return error;
            }
        } else {
            return { status: 401, message: "Faltando dados para cadastro" }
        }
    },

    // **************************************** UPDATE USER
    updateUser = async (body, auth) => {

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

            const updated = {
                name: body.name ? body.name : alreadyUser.name,
                email: body.email ? body.email : alreadyUser.email,
                updatedAt: new Date(),
            }

            try {
                const user = await p.user.update({
                    where: {
                        id: alreadyUser.id
                    },
                    data: updated
                })

                let jwt = sign({ id: user.id, email: user.email }, process.env.SECRET_CLIENT_KEY);

                await p.$disconnect();

                return { user, jwt }

            } catch (error) {
                console.log(error, "Erro ao editar user");
                return error;
            }
        } else {
            return {
                status: 409,
                message: "Usuário sem Autorização"
            }
        }
    },

    // **************************************** DELETE USER
    deleteUser = async (auth) => {

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
                const desc = await p.user.update({
                    where: {
                        id: alreadyUser.id
                    },
                    data: {
                        name: "Usuário",
                        email: "undefined",
                        updatedAt: new Date(),
                        deletedAt: new Date()
                    }
                })

                await p.$disconnect();
                return { status: 200, message: "Usuário deletado com Sucesso!", res: desc }

            } catch (error) {
                console.log(error, "Erro ao editar user");
                return error;
            }
        } else {
            return {
                status: 409,
                message: "Usuário sem Autorização"
            }
        }
    }

module.exports = { signIn, newUser, updateUser, deleteUser };