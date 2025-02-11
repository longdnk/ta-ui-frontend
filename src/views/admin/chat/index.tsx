import {
    Box,
    Flex,
    Icon,
    Input, Menu,
    SimpleGrid,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import React, { useRef, useEffect } from 'react';
import { MdAutoAwesome, MdOutlineRefresh, MdPerson, MdFileCopy } from 'react-icons/md';
import { useChat, useCopyToClipboard, useLocalChat } from "../../../hooks";
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';
import { ChatItem } from "../../../types";
import { useGetAllChatQuery } from "../../../api/conservation/conservation.slice";

export default function ChatView() {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [_, copy] = useCopyToClipboard();

    const borderColor = useColorModeValue('#4229fb', 'whiteAlpha.600');
    const inputColor = useColorModeValue('navy.700', 'white');
    const textColor = useColorModeValue('navy.700', 'white');
    const placeholderColor = useColorModeValue('gray.500', 'whiteAlpha.600');
    const backgroundColor = useColorModeValue('white', 'navy.900');
    const { localChat, updateLocalChat } = useLocalChat()

    const {
        messages,
        inputMessage,
        sendMessage,
        resetMessages,
        isRender,
        textResult,
        chatParam,
        setChatParam,
        updateMessage,
        isChatting,
        isRetrieving,
        setMessages
    } = useChat();

    const isInference = isRender || isChatting || isRetrieving;

    const { isFetching } = useGetAllChatQuery()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChatParam({ ...chatParam, inputMessage: event.target.value });
    };

    const handleSendMessage = async () => {
        if (chatParam.inputMessage.trim()) {
            setChatParam({ ...chatParam, inputMessage: '', isRender: true });
            await sendMessage();
        }
    };

    const handleCopy = (text: string) => {
        copy(text).then(() => console.log("Copied!"));
    };

    const resetResponse = async () => {
        resetMessages();
        await sendMessage();
    };

    const handleKeyPress = async (event: React.KeyboardEvent) => {
        if (chatParam.isRender) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            updateMessage(chatParam.inputMessage);
            await handleSendMessage();
        }
    };

    useEffect(() => {
        if (isFetching) {
            setTimeout(() => {
                const latest = JSON.parse(localStorage.getItem('local_chat'))
                setMessages(latest)
            }, 500)
        }
    }, [localChat, isFetching]);

    useEffect(() => {
        if (!isInference && messages.length > 1) {
            updateLocalChat(messages);
        }
    }, [messages, isInference, updateLocalChat]);

    useEffect(() => {
        if (chatEndRef.current || isInference) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isInference]);

    return (
        <Box
            position={'fixed'}
            pt={{ base: '130px', md: '80px', xl: '80px' }}
            px="10px"
            bg={backgroundColor}
            minH={'90vh'}
            display="flex"
            flexDirection="column"
            mx="4uto"
            mt={'50px'}
            borderRadius={'10px'}
        >
            <SimpleGrid
                mb="20px"
                gap="10px"
                columns={1}
                maxH="550px"
                overflowY="auto"
            >
                <MessageBlock
                    messages={messages}
                    borderColor={borderColor}
                    textColor={textColor}
                    isInference={isInference}
                    resetResponse={resetResponse}
                    handleCopy={handleCopy}
                    textResult={textResult}
                />
                <div ref={chatEndRef}></div>
            </SimpleGrid>
            <Flex
                p="10px"
                bg={backgroundColor}
                flexDirection={{ base: "column", md: "row" }}
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                align="center"
                borderRadius={'10px'}
            >
                <Input
                    focusBorderColor="#4229fb"
                    disabled={isInference}
                    value={inputMessage}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    minH="54px"
                    borderColor={borderColor}
                    borderRadius="20px"
                    p="15px 20px"
                    fontSize="sm"
                    fontWeight="bold"
                    color={inputColor}
                    placeholder="Type your message here..."
                    _placeholder={{ color: placeholderColor }}
                    flex="1"
                />
            </Flex>
        </Box>
    );
}

const MessageBlock: React.FC<{
    messages: ChatItem[],
    borderColor: string,
    textColor: string,
    isInference: boolean,
    resetResponse: () => void,
    handleCopy: (text: string) => void,
    textResult: string
}>
    = props => {
    const { messages, borderColor, textColor, isInference, resetResponse, handleCopy, textResult } = props
    return (
        <>
            {
                messages.map((message, index) => (
                    <Flex
                        key={index}
                        direction={message.role === 'user' ? 'row-reverse' : 'row'}
                        align={index === 0 ? 'flex-start' : 'center'}
                        mb="15px"
                    >
                        <Flex
                            borderRadius="full"
                            justify="center"
                            align="center"
                            bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
                            border="1px solid"
                            borderColor={borderColor}
                            me="10px"
                            h={{ base: "30px", md: "40px" }}
                            w={{ base: "30px", md: "40px" }}
                        >
                            <Icon
                                as={message.role === 'user' ? MdPerson : MdAutoAwesome}
                                width="20px"
                                height="20px"
                                color="white"
                            />
                        </Flex>
                        <Box
                            p="15px"
                            fontWeight={'bold'}
                            border="2px solid"
                            borderColor="#4229fb"
                            borderRadius="14px"
                            bg="transparent"
                            maxW={{ base: "80%", md: "90%" }}
                            position="relative"
                            marginRight={'10px'}
                        >
                            {typeof message.content === 'string' ? (
                                <ReactMarkdown
                                    className="markdown"
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                <Text color={textColor} fontSize="md">
                                    {message.content}
                                </Text>
                            )}
                            {
                                (message.role === 'assistant' && index > 0 && index === messages.length - 1 && !isInference)
                                && (
                                    <>
                                        <Box
                                            position="absolute"
                                            bottom="-15px"
                                            right="0px"
                                            transform="translateX(-50%)"
                                            w="30px"
                                            h="30px"
                                            bg="#4229fb"
                                            borderRadius="full"
                                            border="2px solid white"
                                            boxShadow="lg"
                                            cursor="pointer"
                                            _hover={{ bg: '#6b4de6' }}
                                            onClick={resetResponse}
                                        >
                                            <Icon
                                                as={MdOutlineRefresh} // Thay bằng icon bạn muốn, ví dụ: MdInfo
                                                color="white"
                                                w="24px"
                                                h="24px"
                                                m={'1px'}
                                            />
                                        </Box>
                                        <Box
                                            position="absolute" // Định vị tuyệt đối
                                            bottom="-15px" // Dịch xuống dưới border của Box
                                            right="32px" // Căn giữa theo chiều ngang
                                            transform="translateX(-50%)" // Cân bằng dịch chuyển
                                            w="30px" // Chiều rộng nút
                                            h="30px" // Chiều cao nút
                                            bg="#4229fb" // Màu nền của nút
                                            borderRadius="full" // Hình tròn
                                            border="2px solid white" // Viền trắng để nổi bật hơn
                                            boxShadow="lg" // Đổ bóng
                                            cursor="pointer" // Thêm hiệu ứng khi hover
                                            _hover={{ bg: '#6b4de6' }} // Hiệu ứng màu khi hover
                                            onClick={() => handleCopy(textResult)}
                                        >
                                            <Icon
                                                as={MdFileCopy} // Thay bằng icon bạn muốn, ví dụ: MdInfo
                                                color="white"
                                                w="18px"
                                                h="18px"
                                                m={'4px'}
                                            />
                                        </Box>
                                    </>
                                )
                            }
                        </Box>
                    </Flex>
                ))
            }
        </>
    )
}