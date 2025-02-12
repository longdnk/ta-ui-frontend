import React, { useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    useColorModeValue, useToast,
} from "@chakra-ui/react";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "./schema";
import { useLoginUserMutation } from "../../../api/auth/auth.slice";
import { LoginInfo } from "../../../types";
import { useAuth, useLocalChat } from "../../../hooks";
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    // Chakra color mode
    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const brandStars = useColorModeValue("brand.500", "brand.400");
    const [show, setShow] = React.useState<boolean>(false);
    const handleClick = () => setShow(!show);

    const [loginUser, { isLoading, isSuccess }] = useLoginUserMutation()
    const { addToken } = useAuth()
    const navigate = useNavigate();

    const toast = useToast()
    const { defaultItemChat } = useLocalChat()

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInfo>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (info: LoginInfo) => {
        const { data: user, message } = await loginUser(info).unwrap();

        addToken({
            userEmail: user.email,
            userId: user.id,
            userName: user.user_name,
            accessToken: user.token,
            prompt: user.prompt_ids,
            models: user.models,
            default_prompt: user.default_prompt,
            default_model: user.default_model,
        })
        toast({
            title: `${message}`,
            status: 'success',
            variant: 'solid',
            position: 'top-right',
            duration: 5000,
            isClosable: true,
        })
    };

    useEffect(() => {
        if (isSuccess) {
            navigate('/admin/chat');
        }
    }, [isSuccess, navigate]);

    return (
        <DefaultAuth illustrationBackground={illustration} image={illustration}>
            <Flex
                maxW={{ base: "100%", md: "max-content" }}
                w="100%"
                mx={{ base: "auto", lg: "0px" }}
                me="auto"
                h="100%"
                alignItems="start"
                justifyContent="center"
                mb={{ base: "30px", md: "60px" }}
                px={{ base: "25px", md: "0px" }}
                mt={{ base: "40px", md: "14vh" }}
                flexDirection="column"
            >
                <Box me="auto">
                    <Heading color={textColor} fontSize="36px" mb="10px">
                        Sign In
                    </Heading>
                    <Text
                        mb="36px"
                        ms="4px"
                        color={textColorSecondary}
                        fontWeight="400"
                        fontSize="md"
                    >
                        Enter your email and password to sign in!
                    </Text>
                </Box>
                <Flex
                    zIndex="2"
                    direction="column"
                    w={{ base: "100%", md: "420px" }}
                    maxW="100%"
                    background="transparent"
                    borderRadius="15px"
                    mx={{ base: "auto", lg: "unset" }}
                    me="auto"
                    mb={{ base: "20px", md: "auto" }}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl>
                            <FormLabel
                                display="flex"
                                ms="4px"
                                fontSize="sm"
                                fontWeight="800"
                                color={textColor}
                                mb="8px"
                            >
                                Email or user name<Text color={brandStars}>*</Text>
                            </FormLabel>
                            <Input
                                variant="auth"
                                fontSize="sm"
                                ms={{ base: "0px", md: "0px" }}
                                placeholder="Type email or user name"
                                mb="4px"
                                fontWeight="800"
                                size="lg"
                                {...register("user_name")}
                            />
                            <Text color="red.500" fontSize="sm" mb="24px">
                                {errors.user_name?.message}
                            </Text>
                            <FormLabel
                                ms="4px"
                                fontSize="sm"
                                fontWeight="500"
                                color={textColor}
                                display="flex"
                            >
                                Password<Text color={brandStars}>*</Text>
                            </FormLabel>
                            <InputGroup size="md">
                                <Input
                                    fontSize="sm"
                                    placeholder="Min. 6 characters"
                                    mb="4px"
                                    size="lg"
                                    type={show ? "text" : "password"}
                                    variant="auth"
                                    {...register("password")}
                                />
                                <InputRightElement display="flex" alignItems="center" mt="4px">
                                    <Icon
                                        color={textColorSecondary}
                                        _hover={{ cursor: "pointer" }}
                                        as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                                        onClick={handleClick}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <Text color="red.500" fontSize="sm" mb="24px">
                                {errors.password?.message}
                            </Text>
                            <Button
                                isLoading={isLoading}
                                type="submit"
                                fontSize="sm"
                                variant="brand"
                                fontWeight="500"
                                w="100%"
                                h="50"
                                mb="24px"
                            >
                                Sign In
                            </Button>
                        </FormControl>
                    </form>
                </Flex>
            </Flex>
        </DefaultAuth>
    );
};

export default SignIn;