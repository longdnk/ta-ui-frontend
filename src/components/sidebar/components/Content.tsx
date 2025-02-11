// chakra imports
import { Box, Flex, Stack } from '@chakra-ui/react';
//   Custom components
import Brand from 'components/sidebar/components/Brand';
import Links from 'components/sidebar/components/Links';


// FUNCTIONS

const SidebarContent = (props: { routes: RoutesType[] }) => {
    const { routes } = props;
    const routesDisplay = routes.filter(route => route.path !== '/sign-in')
    // SIDEBAR
    return (
        <Flex direction='column' height='100%' pt='25px' borderRadius='30px'>
            <Brand/>
            <Stack direction='column' mt='8px' mb='auto'>
                <Box ps='20px' pe={{ lg: '16px', '2xl': '16px' }}>
                    <Links routes={routesDisplay}/>
                </Box>
            </Stack>

            <Box ps='20px' pe={{ lg: '16px', '2xl': '20px' }} mt='60px' mb='40px' borderRadius='30px'>
                {/*<SidebarCard />*/}
            </Box>
        </Flex>
    );
}

export default SidebarContent;
