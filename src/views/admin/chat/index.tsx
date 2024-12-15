import {
    Box,
    Button,
    Flex,
    Icon,
    Input, InputGroup,
    InputRightElement,
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

export default function ChatView() {
    const chatEndRef = useRef<HTMLDivElement | null>(null); // Reference to scroll

    // Định nghĩa màu sắc cho các phần tử
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.600');
    const inputColor = useColorModeValue('navy.700', 'white');
    const textColor = useColorModeValue('navy.700', 'white');
    const placeholderColor = useColorModeValue('gray.500', 'whiteAlpha.600');
    const backgroundColor = useColorModeValue('white', 'navy.900');  // Màu nền trắng cho light và xanh nhạt cho dark

    const {
        messages,
        inputMessage,
        sendMessage,
        resetMessages,
        handleChange,
        handleKeyPress,
        isConnected,
        isRender,
        textResult
    } = useChat()

    const [_, copy] = useCopyToClipboard()

    const handleCopy = (text: string) => {
        copy(text).then(() => console.log("Done"))
    }

    const resetResponse = () => {
        resetMessages();
        sendMessage();
    }

    // Đảm bảo cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messages.length > 5) {
            // chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // Cuộn xuống cuối
        }
    }, [messages]); // Chạy mỗi khi messages thay đổi

    return (
        <>
            <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px="10px" bg={backgroundColor} minH="100vh" mt={'50px'}>
                <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px" mb="20px">
                    <Box mb="20px">
                        {/* Hiển thị các tin nhắn */}
                        {messages.map((message, index) => (
                            <Flex
                                key={index}
                                direction={message.role === 'user' ? 'row-reverse' : 'row'}
                                align="center"
                                mb="15px"
                            >
                                <Flex
                                    borderRadius="full"
                                    justify="center"
                                    align="center"
                                    bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
                                    border="1px solid"
                                    borderColor={borderColor}
                                    me="10px"
                                    h="40px"
                                    w="40px"
                                    // background={message.role === 'assistant' ? 'white' : null}
                                >
                                    <Icon
                                        as={message.role === 'user' ? MdPerson : MdAutoAwesome}
                                        width="20px"
                                        height="20px"
                                        color={'white'}
                                    />
                                </Flex>
                                <Box
                                    p="15px"
                                    fontWeight={'bold'}
                                    border="2px solid"
                                    borderColor={'#4229fb'}
                                    borderRadius="14px"
                                    bg={'transparent'}
                                    maxW="80%"
                                    position="relative"
                                >
                                    {
                                        typeof message.content === 'string' ?
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                            :
                                            <Text
                                                color={textColor}
                                                fontWeight="600"
                                                fontSize="md"
                                            >
                                                {message.content}
                                            </Text>
                                    }
                                    {/* Thêm nút */}
                                    {
                                        (message.role === 'assistant' && index > 0 && index === messages.length - 1 && !isRender)
                                        && (
                                            <>
                                                <Box
                                                    position="absolute" // Định vị tuyệt đối
                                                    bottom="-15px" // Dịch xuống dưới border của Box
                                                    right="0px" // Căn giữa theo chiều ngang
                                                    transform="translateX(-50%)" // Cân bằng dịch chuyển
                                                    w="30px" // Chiều rộng nút
                                                    h="30px" // Chiều cao nút
                                                    bg="#4229fb" // Màu nền của nút
                                                    borderRadius="full" // Hình tròn
                                                    border="2px solid white" // Viền trắng để nổi bật hơn
                                                    boxShadow="lg" // Đổ bóng
                                                    cursor="pointer" // Thêm hiệu ứng khi hover
                                                    _hover={{ bg: '#6b4de6' }} // Hiệu ứng màu khi hover
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
                        {/* Phần cuộn xuống cuối */}
                        <div ref={chatEndRef}/>
                    </Box>

                    {/* Input and Send Button */}
                    <Flex>
                        <Input
                            disabled={!isConnected}
                            value={inputMessage}
                            onChange={handleChange}
                            onKeyDown={handleKeyPress}  // Lắng nghe sự kiện nhấn phím
                            minH="54px"
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="30px"
                            p="15px 20px"
                            me="10px"
                            fontSize="sm"
                            fontWeight="bold"
                            color={inputColor}
                            _placeholder={{ color: placeholderColor }}
                            placeholder="Type your message here..."
                        />
                        {/*<Button*/}
                        {/*    onClick={isConnected ? handleSendMessage : reloadPage}*/}
                        {/*    py="20px"*/}
                        {/*    px="16px"*/}
                        {/*    fontSize="sm"*/}
                        {/*    borderRadius="12px"*/}
                        {/*    ms="auto"*/}
                        {/*    h="54px"*/}
                        {/*    bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"*/}
                        {/*    _hover={{*/}
                        {/*        boxShadow:*/}
                        {/*            '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',*/}
                        {/*        bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',*/}
                        {/*    }}*/}
                        {/*    color="white"*/}
                        {/*    disabled={!isConnected}*/}
                        {/*>*/}
                        {/*    {isConnected ? "Send" : "Reconnect"}*/}
                        {/*</Button>*/}
                    </Flex>
                </SimpleGrid>
            </Box>
        </>
    );
}