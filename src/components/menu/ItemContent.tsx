// chakra imports
import { Icon, Flex, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import { MdChatBubble } from "react-icons/md";
import { useGetAllChatQuery, useLazyGetChatByIdQuery } from "../../api/conservation/conservation.slice";
import React, { useEffect } from "react";
import { useLocalChat } from "../../hooks";

export function ItemContent(props: { info: string, createAt: string, id: number }) {
    const textColor = useColorModeValue("navy.700", "white");

    const [trigger, { currentData, isFetching: loadingDetail }] = useLazyGetChatByIdQuery()
    const { refetch } = useGetAllChatQuery()

    const toast = useToast()

    const { updateLocalChat } = useLocalChat()

    const getChatDetail = (event: React.MouseEvent<SVGElement | HTMLDivElement, MouseEvent>) => {
        trigger(event.currentTarget.id)
    }

    useEffect(() => {
        if (!loadingDetail && currentData?.data) {
            toast({
                title: "Getting chat",
                position: "top-right",
                duration: 1000,
                isClosable: true,
                status: "loading",
            })
            setTimeout(() => {
                updateLocalChat(currentData?.data.conversation)
                refetch()
                toast({
                    title: "Get chat content success",
                    position: "top-right",
                    duration: 1000,
                    isClosable: true,
                    status: "success",
                })
            }, 1000)
        }
    }, [loadingDetail, updateLocalChat, refetch, currentData]);

    return (
        <>
            <Flex
                justify='center'
                align='center'
                borderRadius='16px'
                minH={{ base: "60px", md: "70px" }}
                h={{ base: "60px", md: "70px" }}
                minW={{ base: "60px", md: "70px" }}
                w={{ base: "60px", md: "70px" }}
                me='14px'
                bg='linear-gradient(135deg, #868CFF 0%, #4318FF 100%)'
                id={props.id.toString()}
                onClick={getChatDetail}
            >
                <Icon
                    as={MdChatBubble}
                    color='white'
                    w={8}
                    h={14}
                    id={props.id.toString()}
                    onClick={getChatDetail}
                />
            </Flex>
            <Flex flexDirection='column'>
                <Text
                    mb='5px'
                    fontWeight='bold'
                    color={textColor}
                    fontSize={{ base: "md", md: "md" }}>
                    Chat section: {props.info}
                </Text>
                <Flex alignItems='center'>
                    <Text
                        fontSize={{ base: "sm", md: "sm" }}
                        lineHeight='100%'
                        color={textColor}
                    >
                        Created at: {props.createAt}
                    </Text>
                </Flex>
            </Flex>
        </>
    );
}
