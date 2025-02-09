import {
    Box,
    Button,
    Flex,
    Icon,
    Input,
    SimpleGrid,
    Text,
    useColorModeValue
} from '@chakra-ui/react';
import React, { useRef, useEffect } from 'react';
import { MdAutoAwesome, MdOutlineRefresh, MdPerson, MdFileCopy } from 'react-icons/md';
import { useChat, useCopyToClipboard } from "../../../hooks";
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';

export default function ChatView() {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [_, copy] = useCopyToClipboard();

    const borderColor = useColorModeValue('#4229fb', 'whiteAlpha.600');
    const inputColor = useColorModeValue('navy.700', 'white');
    const textColor = useColorModeValue('navy.700', 'white');
    const placeholderColor = useColorModeValue('gray.500', 'whiteAlpha.600');
    const backgroundColor = useColorModeValue('white', 'navy.900');

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
        isRetrieving
    } = useChat();

    const isInference = isRender || isChatting || isRetrieving;

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChatParam({ ...chatParam, inputMessage: event.target.value });
    };

    const handleSendMessage = () => {
        if (chatParam.inputMessage.trim()) {
            sendMessage();
            setChatParam({ ...chatParam, inputMessage: '', isRender: true });
        }
    };

    const handleCopy = (text: string) => {
        copy(text).then(() => console.log("Copied!"));
    };

    const resetResponse = () => {
        resetMessages();
        sendMessage();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (chatParam.isRender) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            updateMessage(chatParam.inputMessage);
            handleSendMessage();
        }
    };

    return (
        <Box
            position={'fixed'}
            pt={{ base: '130px', md: '80px', xl: '80px' }}
            px="10px"
            borderRadius={'10px'}
            bg={backgroundColor}
            minH="100vh"
            display="flex"
            flexDirection="column"
            mx="auto"
        >
            <SimpleGrid columns={1} gap="10px" mb="20px" flex="1" overflowY="auto" maxH="570px">
                {messages.map((message, index) => (
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
                            maxW={{ base: "90%", md: "80%" }}
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
                ))}
                <div ref={chatEndRef}/>
            </SimpleGrid>
            <Flex p="10px" bg={backgroundColor} flexDirection={{ base: "column", md: "row" }}>
                <Input
                    focusBorderColor="#4229fb"
                    disabled={isChatting}
                    value={inputMessage}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    minH="54px"
                    borderColor={borderColor}
                    borderRadius="30px"
                    p="15px 20px"
                    fontSize="sm"
                    fontWeight="bold"
                    color={inputColor}
                    placeholder="Type your message here..."
                    _placeholder={{ color: placeholderColor }}
                    flex="1"
                />
                <Button
                    ml={{ base: "0", md: "10px" }}
                    mt={{ base: "10px", md: "5px" }}
                    colorScheme="blue"
                    onClick={handleSendMessage}
                    isDisabled={isInference}
                    isLoading={isInference}
                >
                    Send
                </Button>
            </Flex>
        </Box>
    );
}